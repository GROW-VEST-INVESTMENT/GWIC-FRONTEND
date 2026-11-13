const mongoose = require('mongoose');
const AdminAuditLog = require('../models/AdminAuditLog');
const InvestmentPlan = require('../models/InvestmentPlan');
const SavingsGoal = require('../models/SavingsGoal');
const SupportRequest = require('../models/SupportRequest');
const User = require('../models/User');
const VerificationRequest = require('../models/VerificationRequest');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

async function getUserDetails(req, res, next) {
  if (!isValidObjectId(req.params.userId)) {
    return res.status(400).json({ message: 'Invalid user ID.' });
  }

  try {
    const [user, wallet, transactions, verificationRequests, supportRequests, investmentPlans, savingsGoals] = await Promise.all([
      User.findById(req.params.userId)
        .select('name email phone role status suspensionReason suspendedAt transactionRestricted transactionRestrictionReason transactionRestrictedAt isKycVerified product goal createdAt')
        .lean(),
      Wallet.findOne({ userId: req.params.userId }).lean(),
      WalletTransaction.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(10).lean(),
      VerificationRequest.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(10).lean(),
      SupportRequest.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(10).lean(),
      InvestmentPlan.find({ userId: req.params.userId }).sort({ createdAt: -1 }).lean(),
      SavingsGoal.find({ userId: req.params.userId }).sort({ createdAt: -1 }).lean(),
    ]);

    if (!user) return res.status(404).json({ message: 'User account not found.' });

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'user',
        status: user.status || 'active',
        suspensionReason: user.suspensionReason || '',
        suspendedAt: user.suspendedAt,
        statusBeforeSuspension: user.statusBeforeSuspension,
        transactionRestricted: !!user.transactionRestricted,
        transactionRestrictionReason: user.transactionRestrictionReason || '',
        transactionRestrictedAt: user.transactionRestrictedAt,
        kycVerified: !!user.isKycVerified,
        product: user.product,
        goal: user.goal,
        createdAt: user.createdAt,
      },
      wallet: wallet ? { balance: wallet.balanceKobo / 100, updatedAt: wallet.updatedAt } : null,
      transactions: transactions.map((transaction) => ({
        reference: transaction.reference,
        type: transaction.type,
        amount: transaction.amountKobo / 100,
        status: transaction.status,
        createdAt: transaction.createdAt,
      })),
      verificationRequests: verificationRequests.map((request) => ({
        status: request.status,
        createdAt: request.createdAt,
        reviewedAt: request.reviewedAt,
      })),
      supportRequests: supportRequests.map((request) => ({
        reference: request.reference,
        subject: request.subject,
        category: request.category,
        status: request.status,
        createdAt: request.createdAt,
      })),
      investmentPlans: investmentPlans.map((plan) => ({
        productType: plan.productType,
        principal: plan.principalKobo / 100,
        startDate: plan.startDate,
        maturityDate: plan.maturityDate,
        status: plan.status,
      })),
      savingsGoals: savingsGoals.map((goal) => ({
        name: goal.name,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate,
        savedAmount: goal.savedAmount,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

async function updateAccountStatus(req, res, next) {
  const { status, reason } = req.body || {};
  const normalizedReason = typeof reason === 'string' ? reason.trim() : '';
  if (!['active', 'suspended'].includes(status) || normalizedReason.length < 3 || normalizedReason.length > 500) {
    return res.status(400).json({ message: 'Choose active or suspended and provide a reason between 3 and 500 characters.' });
  }
  if (!isValidObjectId(req.params.userId)) {
    return res.status(400).json({ message: 'Invalid user ID.' });
  }

  const session = await mongoose.startSession();
  try {
    let updatedUser;
    await session.withTransaction(async () => {
      const user = await User.findById(req.params.userId).session(session);
      if (!user || user.role !== 'user') {
        const error = new Error('Regular user account not found.');
        error.status = 404;
        throw error;
      }
      if (user.status === status) {
        const error = new Error(`Account is already ${status}.`);
        error.status = 409;
        throw error;
      }

      const previousStatus = user.status || 'active';
      const nextStatus = status === 'suspended'
        ? 'suspended'
        : (user.statusBeforeSuspension || 'active');
      user.statusBeforeSuspension = status === 'suspended' ? previousStatus : null;
      user.status = nextStatus;
      user.sessionVersion += 1;
      user.suspensionReason = status === 'suspended' ? normalizedReason : '';
      user.suspendedAt = status === 'suspended' ? new Date() : null;
      user.suspendedBy = status === 'suspended' ? req.user._id : null;
      await user.save({ session });
      await new AdminAuditLog({
        actorId: req.user._id,
        action: 'user.account_status_updated',
        targetType: 'user',
        targetId: user._id,
        previousStatus,
        nextStatus,
        note: normalizedReason,
      }).save({ session });
      updatedUser = {
        id: user.id,
        status: user.status,
        statusBeforeSuspension: user.statusBeforeSuspension,
        suspensionReason: user.suspensionReason,
        suspendedAt: user.suspendedAt,
      };
    });

    return res.json({
      message: updatedUser.status === 'suspended'
        ? 'Account frozen. The customer can no longer sign in.'
        : 'Account status restored.',
      user: updatedUser,
    });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
}

async function updateTransactionRestriction(req, res, next) {
  const { restricted, reason } = req.body || {};
  const normalizedReason = typeof reason === 'string' ? reason.trim() : '';
  if (typeof restricted !== 'boolean' || normalizedReason.length < 3 || normalizedReason.length > 500) {
    return res.status(400).json({ message: 'Choose whether transactions should be restricted and provide a reason between 3 and 500 characters.' });
  }
  if (!isValidObjectId(req.params.userId)) {
    return res.status(400).json({ message: 'Invalid user ID.' });
  }

  const session = await mongoose.startSession();
  try {
    let updatedUser;
    await session.withTransaction(async () => {
      const user = await User.findById(req.params.userId).session(session);
      if (!user || user.role !== 'user') {
        const error = new Error('Regular user account not found.');
        error.status = 404;
        throw error;
      }
      if (!!user.transactionRestricted === restricted) {
        const error = new Error(`Transaction access is already ${restricted ? 'restricted' : 'available'}.`);
        error.status = 409;
        throw error;
      }

      const previousStatus = user.transactionRestricted ? 'restricted' : 'available';
      user.transactionRestricted = restricted;
      user.transactionRestrictionReason = restricted ? normalizedReason : '';
      user.transactionRestrictedAt = restricted ? new Date() : null;
      user.transactionRestrictedBy = restricted ? req.user._id : null;
      await user.save({ session });
      await new AdminAuditLog({
        actorId: req.user._id,
        action: 'user.transaction_restriction_updated',
        targetType: 'user',
        targetId: user._id,
        previousStatus,
        nextStatus: restricted ? 'restricted' : 'available',
        note: normalizedReason,
      }).save({ session });
      updatedUser = {
        id: user.id,
        transactionRestricted: user.transactionRestricted,
        transactionRestrictionReason: user.transactionRestrictionReason,
        transactionRestrictedAt: user.transactionRestrictedAt,
      };
    });

    return res.json({
      message: restricted ? 'Transaction access restricted.' : 'Transaction access restored.',
      user: updatedUser,
    });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
}

module.exports = {
  getUserDetails,
  updateAccountStatus,
  updateTransactionRestriction,
};
