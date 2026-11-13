function requireTransactionsAllowed(req, res, next) {
  if (req.user?.transactionRestricted) {
    return res.status(403).json({ message: 'Transaction access is restricted. Please contact support.' });
  }

  return next();
}

module.exports = requireTransactionsAllowed;
