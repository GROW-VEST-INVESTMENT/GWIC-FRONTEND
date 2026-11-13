const mongoose = require('mongoose');
const AdminAuditLog = require('../models/AdminAuditLog');
const SupportRequest = require('../models/SupportRequest');
const User = require('../models/User');
const VerificationRequest = require('../models/VerificationRequest');
const Wallet = require('../models/Wallet');

const VERIFICATION_STATUSES = ['pending', 'verified', 'rejected'];
const SUPPORT_STATUSES = ['open', 'in_progress', 'resolved'];
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

async function listVerificationRequests(req, res, next) {
  const status = req.query.status || 'pending';
  if (!['all', ...VERIFICATION_STATUSES].includes(status)) {
    return res.status(400).json({ message: 'Choose all, pending, verified, or rejected status.' });
  }

  try {
    const filter = status === 'all' ? {} : { status };
    const [requests, pending, verified, rejected] = await Promise.all([
      VerificationRequest.find(filter)
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('userId', 'name email phone')
        .lean(),
      VerificationRequest.countDocuments({ status: 'pending' }),
      VerificationRequest.countDocuments({ status: 'verified' }),
      VerificationRequest.countDocuments({ status: 'rejected' }),
    ]);

    return res.json({
      stats: { pending, verified, rejected },
      requests: requests.map((request) => ({
        id: request._id.toString(),
        user: request.userId ? {
          id: request.userId._id.toString(),
          name: request.userId.name,
          email: request.userId.email,
          phone: request.userId.phone,
        } : null,
        legalName: request.legalName,
        dateOfBirth: request.dateOfBirth,
        status: request.status,
        createdAt: request.createdAt,
        reviewedAt: request.reviewedAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

async function reviewVerification(req, res, next) {
  const { decision, note, evidenceReviewed } = req.body || {};
  const normalizedNote = typeof note === 'string' ? note.trim() : '';
  if (
    !['verified', 'rejected'].includes(decision)
    || normalizedNote.length < 3
    || normalizedNote.length > 500
    || evidenceReviewed !== true
  ) {
    return res.status(400).json({
      message: 'Choose verified or rejected, confirm the evidence was reviewed, and provide a note between 3 and 500 characters.',
    });
  }
  if (!isValidObjectId(req.params.requestId)) {
    return res.status(400).json({ message: 'Invalid verification request ID.' });
  }

  const session = await mongoose.startSession();
  try {
    let reviewed;
    await session.withTransaction(async () => {
      const request = await VerificationRequest.findOne({
        _id: req.params.requestId,
        status: 'pending',
      }).session(session);
      if (!request) {
        const error = new Error('Pending verification request not found.');
        error.status = 404;
        throw error;
      }

      const user = await User.findById(request.userId).session(session);
      if (!user) {
        const error = new Error('Account for this verification request was not found.');
        error.status = 404;
        throw error;
      }

      const previousStatus = request.status;
      request.status = decision;
      request.reviewedAt = new Date();
      request.reviewerNote = normalizedNote;
      user.isKycVerified = decision === 'verified';
      await request.save({ session });
      await user.save({ session });
      await new AdminAuditLog({
        actorId: req.user.id,
        action: 'kyc.reviewed',
        targetType: 'verification_request',
        targetId: request._id,
        previousStatus,
        nextStatus: decision,
        note: normalizedNote,
        evidenceReviewed: true,
      }).save({ session });
      reviewed = { id: request.id, status: request.status, reviewedAt: request.reviewedAt };
    });

    return res.json({ message: 'Verification review saved.', request: reviewed });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
}

async function listSupportRequests(req, res, next) {
  const status = req.query.status || 'all';
  if (!['all', ...SUPPORT_STATUSES].includes(status)) {
    return res.status(400).json({ message: 'Choose all, open, in_progress, or resolved status.' });
  }

  try {
    const filter = status === 'all' ? {} : { status };
    const [requests, open, inProgress, resolved] = await Promise.all([
      SupportRequest.find(filter)
        .sort({ updatedAt: -1 })
        .limit(100)
        .populate('userId', 'name email phone')
        .lean(),
      SupportRequest.countDocuments({ status: 'open' }),
      SupportRequest.countDocuments({ status: 'in_progress' }),
      SupportRequest.countDocuments({ status: 'resolved' }),
    ]);

    return res.json({
      stats: { open, inProgress, resolved },
      requests: requests.map((request) => ({
        id: request._id.toString(),
        reference: request.reference,
        user: request.userId ? {
          id: request.userId._id.toString(),
          name: request.userId.name,
          email: request.userId.email,
          phone: request.userId.phone,
        } : null,
        category: request.category,
        subject: request.subject,
        message: request.message,
        status: request.status,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        resolvedAt: request.resolvedAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

async function updateSupportRequest(req, res, next) {
  const { status, note } = req.body || {};
  const normalizedNote = typeof note === 'string' ? note.trim() : '';
  if (!SUPPORT_STATUSES.includes(status) || normalizedNote.length < 3 || normalizedNote.length > 1000) {
    return res.status(400).json({ message: 'Choose a valid status and provide a note between 3 and 1,000 characters.' });
  }
  if (!isValidObjectId(req.params.requestId)) {
    return res.status(400).json({ message: 'Invalid support request ID.' });
  }

  const session = await mongoose.startSession();
  try {
    let updated;
    await session.withTransaction(async () => {
      const request = await SupportRequest.findById(req.params.requestId).session(session);
      if (!request) {
        const error = new Error('Support request not found.');
        error.status = 404;
        throw error;
      }

      const previousStatus = request.status;
      request.status = status;
      request.staffNote = normalizedNote;
      request.resolvedAt = status === 'resolved' ? new Date() : null;
      await request.save({ session });
      await new AdminAuditLog({
        actorId: req.user.id,
        action: 'support.status_updated',
        targetType: 'support_request',
        targetId: request._id,
        previousStatus,
        nextStatus: status,
        note: normalizedNote,
      }).save({ session });
      updated = {
        id: request.id,
        reference: request.reference,
        status: request.status,
        updatedAt: request.updatedAt,
        resolvedAt: request.resolvedAt,
      };
    });

    return res.json({ message: 'Support request status updated.', request: updated });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
}

async function getWalletSummary(_req, res, next) {
  try {
    const [summary, wallets] = await Promise.all([
      Wallet.aggregate([
        { $group: { _id: null, totalBalanceKobo: { $sum: '$balanceKobo' }, walletCount: { $sum: 1 } } },
      ]),
      Wallet.find({})
        .sort({ updatedAt: -1 })
        .limit(100)
        .populate('userId', 'name email')
        .lean(),
    ]);
    const totals = summary[0] || { totalBalanceKobo: 0, walletCount: 0 };
    return res.json({
      summary: {
        totalBalance: totals.totalBalanceKobo / 100,
        walletCount: totals.walletCount,
        recordsShown: wallets.length,
      },
      wallets: wallets.map((wallet) => ({
        id: wallet._id.toString(),
        user: wallet.userId?.name || 'Unknown user',
        email: wallet.userId?.email || '',
        balance: wallet.balanceKobo / 100,
        updatedAt: wallet.updatedAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

async function listAuditLogs(_req, res, next) {
  try {
    const entries = await AdminAuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('actorId', 'name email role')
      .lean();
    return res.json({
      entries: entries.map((entry) => ({
        id: entry._id.toString(),
        actor: entry.actorId ? {
          name: entry.actorId.name,
          email: entry.actorId.email,
          role: entry.actorId.role,
        } : null,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId.toString(),
        previousStatus: entry.previousStatus,
        nextStatus: entry.nextStatus,
        note: entry.note,
        evidenceReviewed: entry.evidenceReviewed,
        createdAt: entry.createdAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getWalletSummary,
  listAuditLogs,
  listSupportRequests,
  listVerificationRequests,
  reviewVerification,
  updateSupportRequest,
};
