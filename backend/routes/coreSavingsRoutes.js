const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireTransactionsAllowed = require('../middleware/requireTransactionsAllowed');
const {
  createCoreSavingsPlan,
  getCoreSavings,
  liquidateCoreSavingsPlan,
} = require('../controllers/coreSavingsController');

const router = express.Router();

router.use(requireAuth);
router.get('/', getCoreSavings);
router.post('/plans', requireTransactionsAllowed, createCoreSavingsPlan);
router.post('/plans/:planId/liquidate', requireTransactionsAllowed, liquidateCoreSavingsPlan);

module.exports = router;
