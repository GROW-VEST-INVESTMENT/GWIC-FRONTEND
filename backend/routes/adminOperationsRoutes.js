const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');
const requireAdminOrigin = require('../middleware/requireAdminOrigin');
const {
  getWalletSummary,
  listAuditLogs,
  listSupportRequests,
  listVerificationRequests,
  reviewVerification,
  updateSupportRequest,
} = require('../controllers/adminOperationsController');

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get('/wallets', getWalletSummary);
router.get('/verification-requests', listVerificationRequests);
router.patch('/verification-requests/:requestId', requireAdminOrigin, reviewVerification);
router.get('/support-requests', listSupportRequests);
router.patch('/support-requests/:requestId', requireAdminOrigin, updateSupportRequest);
router.get('/audit-logs', listAuditLogs);

module.exports = router;
