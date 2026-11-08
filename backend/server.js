const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Wallet = require('./models/Wallet');
const WalletTransaction = require('./models/WalletTransaction');
const SupportRequest = require('./models/SupportRequest');
const requireAuth = require('./middleware/requireAuth');
const dashboardRoutes = require('./routes/dashboardRoutes');
const coreLockRoutes = require('./routes/coreLockRoutes');
const coreSavingsRoutes = require('./routes/coreSavingsRoutes');
const walletRoutes = require('./routes/walletRoutes');
const accountRoutes = require('./routes/accountRoutes');
const accountReviewRoutes = require('./routes/accountReviewRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const { startCoreSavingsScheduler } = require('./services/coreSavingsScheduler');
const { handlePaystackWebhook } = require('./controllers/walletController');

const app = express();
const PORT = process.env.PORT || 5000;
const officialFrontendOrigins = [
  'https://kalmacapital.com',
  'https://www.kalmacapital.com',
  'https://kalmacapital.com.ng',
  'https://www.kalmacapital.com.ng',
];
const configuredFrontendOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  ...(process.env.CORS_ORIGINS || '').split(','),
].filter(Boolean).map((origin) => origin.trim());
const getSessionToken = (req) => req.headers.cookie?.split(';').map((part) => part.trim())
  .find((part) => part.startsWith('gwic_session='))?.slice('gwic_session='.length);
const useCrossSiteCookies = (() => {
  const hosts = configuredFrontendOrigins
    .map((origin) => {
      try {
        return new URL(origin).hostname.toLowerCase();
      } catch {
        return '';
      }
    })
    .filter(Boolean);

  return process.env.NODE_ENV === 'production' || hosts.some((host) => !['localhost', '127.0.0.1'].includes(host));
})();
const getCookieOptions = () => ({
  httpOnly: true,
  secure: useCrossSiteCookies,
  sameSite: useCrossSiteCookies ? 'none' : 'lax',
  path: '/',
  maxAge: 60 * 60 * 1000,
});
const allowedOrigins = [
  ...officialFrontendOrigins,
  ...configuredFrontendOrigins,
  ...(process.env.NODE_ENV !== 'production'
    ? ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://127.0.0.1:4173']
    : []),
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return allowedOrigins.includes(origin.trim());
};

app.use(cors({
  credentials: true,
  origin(origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
}));
app.post('/api/paystack/webhook', express.raw({ type: 'application/json', limit: '64kb' }), handlePaystackWebhook);
app.use(express.json({ limit: '16kb' }));
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/core-lock', coreLockRoutes);
app.use('/api/core-savings', coreSavingsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/account-review', accountReviewRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Kalma Capital Backend API is running.',
    health: '/api/health',
  });
});

app.get('/api/health', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ status: 'degraded', database: 'disconnected' });
  }

  try {
    await mongoose.connection.db.admin().ping();
    return res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('MongoDB health check failed:', error.name);
    return res.status(503).json({ status: 'degraded', database: 'unavailable' });
  }
});

app.post('/api/auth/register', async (req, res, next) => {
  const { name, email, phone = '', goal, product, password } = req.body || {};

  if (
    typeof name !== 'string'
    || typeof email !== 'string'
    || typeof phone !== 'string'
    || typeof goal !== 'string'
    || typeof product !== 'string'
    || typeof password !== 'string'
  ) {
    return res.status(400).json({ message: 'Please complete all required fields.' });
  }

  const normalizedName = name.trim().replace(/\s+/g, ' ');
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();

  if (
    !normalizedName
    || normalizedName.length > 100
    || normalizedEmail.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    || normalizedPhone.length > 32
    || password.length < 8
    || Buffer.byteLength(password, 'utf8') > 72
    || !User.GOALS.includes(goal)
    || !User.PRODUCTS.includes(product)
  ) {
    return res.status(400).json({ message: 'Please check your details and try again.' });
  }
  if (!/^\S+(?:\s+\S+)+$/.test(normalizedName)) {
    return res.status(400).json({ message: 'Enter your full legal name as it appears on your bank account and identity records.' });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Account registration is temporarily unavailable.' });
  }

  try {
    await User.create({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      goal,
      product,
      passwordHash: password,
    });
    return res.status(201).json({ message: 'Your account has been created.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    return next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  const { email, password } = req.body || {};
  if (
    typeof email !== 'string'
    || typeof password !== 'string'
    || email.trim().length > 254
    || !email.trim()
    || !password
    || Buffer.byteLength(password, 'utf8') > 72
  ) {
    return res.status(400).json({ message: 'Please enter a valid email and password.' });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Login is temporarily unavailable.' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const configuredAdminPassword = (process.env.ADMIN_PASSWORD || '').trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    const passwordMatches = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;
    const isConfiguredAdminLogin = configuredAdminEmail && normalizedEmail === configuredAdminEmail && configuredAdminPassword && password === configuredAdminPassword;

    if (user && isConfiguredAdminLogin) {
      user.name = (process.env.ADMIN_NAME || user.name || 'Kalma Capital Administrator').trim() || user.name;
      user.role = 'super_admin';
      user.status = 'active';
      user.isKycVerified = true;
      user.goal = user.goal || 'Emergency savings';
      user.product = user.product || 'core-lock';
      user.passwordHash = configuredAdminPassword;
      await user.save();
    }

    if (!user || (!passwordMatches && !isConfiguredAdminLogin)) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const token = jwt.sign(
      { sub: user.id, ver: user.sessionVersion },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );
    res.cookie('gwic_session', token, getCookieOptions());

    return res.json({
      message: 'You are now logged in.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        status: user.status || 'active',
      },
    });
  } catch (error) {
    return next(error);
  }
});

const requireAdmin = (req, res, next) => {
  const { role } = req.user || {};
  if (!role || !['admin', 'super_admin'].includes(role)) {
    return res.status(403).json({ message: 'Access denied. Admin privileges are required.' });
  }
  return next();
};

app.get('/api/auth/me', requireAuth, (req, res) => {
  return res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role || 'user',
      status: req.user.status || 'active',
    },
  });
});

app.get('/api/admin/overview', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, admins, pendingKyc, totalWalletBalance, recentTransactions, supportTickets] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ role: { $in: ['admin', 'super_admin'] } }),
      User.countDocuments({ isKycVerified: false }),
      Wallet.aggregate([
        { $group: { _id: null, total: { $sum: '$balanceKobo' } } },
      ]),
      WalletTransaction.find({}).sort({ createdAt: -1 }).limit(6).populate('userId', 'name email').lean(),
      SupportRequest.find({}).sort({ createdAt: -1 }).limit(6).populate('userId', 'name email').lean(),
    ]);

    const totalWalletValue = (totalWalletBalance[0]?.total || 0) / 100;
    const normalizedTransactions = recentTransactions.map((transaction) => ({
      reference: transaction.reference,
      user: transaction.userId?.name || 'Unknown user',
      email: transaction.userId?.email || '',
      type: transaction.type,
      amount: `₦${(transaction.amountKobo / 100).toLocaleString()}`,
      status: transaction.status,
      createdAt: transaction.createdAt,
    }));

    const normalizedTickets = supportTickets.map((ticket) => ({
      id: ticket.reference,
      customer: ticket.userId?.name || 'Unknown user',
      email: ticket.userId?.email || '',
      subject: ticket.subject,
      priority: ticket.status === 'open' ? 'High' : ticket.status === 'in_progress' ? 'Medium' : 'Low',
      status: ticket.status,
    }));

    return res.json({
      summary: {
        totalUsers,
        activeUsers,
        adminUsers: admins,
        pendingKyc,
        walletBalance: totalWalletValue,
      },
      transactions: normalizedTransactions,
      supportTickets: normalizedTickets,
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).select('name email role status isKycVerified product').lean();
    return res.json({ users: users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      status: user.status || 'active',
      kycVerified: !!user.isKycVerified,
      product: user.product,
    })) });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/admin/transactions', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const transactions = await WalletTransaction.find({}).sort({ createdAt: -1 }).limit(50).populate('userId', 'name email').lean();
    return res.json({ transactions: transactions.map((transaction) => ({
      id: transaction.reference,
      user: transaction.userId?.name || 'Unknown user',
      email: transaction.userId?.email || '',
      type: transaction.type,
      amount: `₦${(transaction.amountKobo / 100).toLocaleString()}`,
      status: transaction.status,
      createdAt: transaction.createdAt,
    })) });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/admin/kyc', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).select('name email isKycVerified role status').lean();
    return res.json({ users: users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      status: user.isKycVerified ? 'Verified' : 'Pending review',
      role: user.role || 'user',
      statusCode: user.isKycVerified ? 'verified' : 'pending',
    })) });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/admin/support', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const tickets = await SupportRequest.find({}).sort({ createdAt: -1 }).limit(50).populate('userId', 'name email').lean();
    return res.json({ tickets: tickets.map((ticket) => ({
      id: ticket.reference,
      customer: ticket.userId?.name || 'Unknown user',
      email: ticket.userId?.email || '',
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.status === 'open' ? 'High' : ticket.status === 'in_progress' ? 'Medium' : 'Low',
    })) });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/auth/logout', async (req, res, next) => {
  const token = getSessionToken(req);
  if (token) {
    try {
      const { sub } = jwt.verify(token, process.env.JWT_SECRET);
      await User.updateOne({ _id: sub }, { $inc: { sessionVersion: 1 } });
    } catch (error) {
      if (error.name !== 'JsonWebTokenError' && error.name !== 'TokenExpiredError') {
        return next(error);
      }
    }
  }

  res.clearCookie('gwic_session', getCookieOptions());
  return res.json({ message: 'You are now logged out.' });
});

app.use((error, req, res, next) => {
  console.error('API request failed:', error.stack || error);
  if (res.headersSent) {
    return next(error);
  }
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500
    ? error.status
    : 500;
  return res.status(status).json({
    message: error.code === 'PAYSTACK_AUTH'
      ? error.message
      : status < 500 ? error.message : 'Something went wrong. Please try again.',
  });
});

async function ensureDefaultAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();
  const adminName = (process.env.ADMIN_NAME || 'Kalma Capital Administrator').trim();

  if (!adminEmail || !adminPassword) {
    console.log('Admin bootstrap skipped: ADMIN_EMAIL and ADMIN_PASSWORD are not configured.');
    return;
  }

  const existingUser = await User.findOne({ email: adminEmail });
  if (existingUser) {
    existingUser.name = adminName || existingUser.name;
    existingUser.role = 'super_admin';
    existingUser.status = 'active';
    existingUser.isKycVerified = true;
    existingUser.goal = existingUser.goal || 'Emergency savings';
    existingUser.product = existingUser.product || 'core-lock';
    existingUser.passwordHash = adminPassword;
    await existingUser.save();
    console.log(`Admin account synced for ${adminEmail}.`);
    return;
  }

  const createdUser = await User.create({
    name: adminName,
    email: adminEmail,
    phone: '',
    goal: 'Emergency savings',
    product: 'core-lock',
    role: 'super_admin',
    status: 'active',
    isKycVerified: true,
    passwordHash: adminPassword,
  });

  console.log(`Admin account created for ${createdUser.email}.`);
}

async function startServer() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured.');
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB connected.');
  await ensureDefaultAdminUser();
  startCoreSavingsScheduler();
  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Backend startup failed:', error.name, error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
