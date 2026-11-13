const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireTransactionsAllowed = require('../middleware/requireTransactionsAllowed');
const {
  getWallet,
  getWalletTransactions,
  getBanks,
  initializeDeposit,
  verifyDeposit,
  resolveWithdrawalAccount,
  createWithdrawal,
} = require('../controllers/walletController');

const router = express.Router();

router.use(requireAuth);
router.get('/transactions', getWalletTransactions);
router.get('/', getWallet);
router.get('/banks', getBanks);
router.post('/deposits', requireTransactionsAllowed, initializeDeposit);
router.post('/deposits/verify', verifyDeposit);
router.post('/withdrawals/resolve', requireTransactionsAllowed, resolveWithdrawalAccount);
router.post('/withdrawals', requireTransactionsAllowed, createWithdrawal);

module.exports = router;
