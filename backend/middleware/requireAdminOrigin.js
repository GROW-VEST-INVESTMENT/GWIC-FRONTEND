const LOCAL_ADMIN_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

function requireAdminOrigin(req, res, next) {
  const origin = req.get('origin');
  const configuredOrigins = [
    process.env.ADMIN_URL,
    ...(process.env.CORS_ORIGINS || '').split(','),
  ].filter(Boolean).map((value) => value.trim());
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? configuredOrigins
    : [...configuredOrigins, ...LOCAL_ADMIN_ORIGINS];

  if (!origin || !allowedOrigins.includes(origin.trim())) {
    return res.status(403).json({ message: 'This admin action must come from an approved admin origin.' });
  }

  return next();
}

module.exports = requireAdminOrigin;
