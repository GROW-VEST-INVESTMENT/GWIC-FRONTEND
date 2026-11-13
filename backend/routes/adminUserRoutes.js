const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');
const requireAdminOrigin = require('../middleware/requireAdminOrigin');
const {
  getUserDetails,
  updateAccountStatus,
  updateTransactionRestriction,
} = require('../controllers/adminUserController');

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get('/:userId', getUserDetails);
router.patch('/:userId/account-status', requireAdminOrigin, updateAccountStatus);
router.patch('/:userId/transaction-restriction', requireAdminOrigin, updateTransactionRestriction);

module.exports = router;
