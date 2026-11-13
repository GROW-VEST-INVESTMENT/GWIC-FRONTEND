const assert = require('node:assert/strict');
const { test } = require('node:test');
const mongoose = require('mongoose');
const AdminAuditLog = require('../models/AdminAuditLog');
const User = require('../models/User');
const {
  updateAccountStatus,
  updateTransactionRestriction,
} = require('../controllers/adminUserController');
const requireAuth = require('../middleware/requireAuth');
const requireTransactionsAllowed = require('../middleware/requireTransactionsAllowed');
const jwt = require('jsonwebtoken');

function makeResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return body;
    },
  };
}

test('account status changes require a valid action and meaningful reason', async () => {
  for (const body of [
    { status: 'pending', reason: 'Reviewed account' },
    { status: 'suspended', reason: 'No' },
    { status: 'suspended', reason: '' },
  ]) {
    const response = makeResponse();
    await updateAccountStatus(
      { body, params: { userId: '507f1f77bcf86cd799439011' } },
      response,
      (error) => { throw error; },
    );
    assert.equal(response.statusCode, 400);
  }
});

test('freezing a user records the reason and invalidates existing sessions', async () => {
  const originalStartSession = mongoose.startSession;
  const originalFindById = User.findById;
  const originalAuditSave = AdminAuditLog.prototype.save;
  const targetId = new mongoose.Types.ObjectId();
  const actorId = new mongoose.Types.ObjectId();
  const user = {
    _id: targetId,
    id: targetId.toString(),
    role: 'user',
    status: 'pending',
    sessionVersion: 3,
    async save() {},
  };
  let auditEntry;

  mongoose.startSession = async () => ({
    withTransaction: async (operation) => operation(),
    async endSession() {},
  });
  User.findById = () => ({ session: () => user });
  AdminAuditLog.prototype.save = async function save() {
    auditEntry = this;
    return this;
  };

  try {
    const response = makeResponse();
    await updateAccountStatus(
      {
        body: { status: 'suspended', reason: 'Fraud review requested' },
        params: { userId: targetId.toString() },
        user: { _id: actorId },
      },
      response,
      (error) => { throw error; },
    );

    assert.equal(response.statusCode, 200);
    assert.equal(user.status, 'suspended');
    assert.equal(user.statusBeforeSuspension, 'pending');
    assert.equal(user.sessionVersion, 4);
    assert.equal(user.suspensionReason, 'Fraud review requested');
    assert.equal(response.body.user.status, 'suspended');
    assert.equal(auditEntry.action, 'user.account_status_updated');
    assert.equal(auditEntry.note, 'Fraud review requested');

    const restoreResponse = makeResponse();
    await updateAccountStatus(
      {
        body: { status: 'active', reason: 'Review complete' },
        params: { userId: targetId.toString() },
        user: { _id: actorId },
      },
      restoreResponse,
      (error) => { throw error; },
    );
    assert.equal(restoreResponse.statusCode, 200);
    assert.equal(user.status, 'pending');
    assert.equal(user.sessionVersion, 5);
    assert.equal(auditEntry.nextStatus, 'pending');

    const invalidRestoreResponse = makeResponse();
    let invalidRestoreError;
    await updateAccountStatus(
      {
        body: { status: 'active', reason: 'Premature activation' },
        params: { userId: targetId.toString() },
        user: { _id: actorId },
      },
      invalidRestoreResponse,
      (error) => { invalidRestoreError = error; },
    );
    assert.equal(invalidRestoreError.status, 409);
  } finally {
    mongoose.startSession = originalStartSession;
    User.findById = originalFindById;
    AdminAuditLog.prototype.save = originalAuditSave;
  }
});

test('authentication rejects a valid session for a suspended account', async () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalFindById = User.findById;
  process.env.JWT_SECRET = 'test-secret';
  User.findById = () => ({
    select: async () => ({ sessionVersion: 0, status: 'suspended' }),
  });

  try {
    const token = jwt.sign({ sub: '507f1f77bcf86cd799439011', ver: 0 }, process.env.JWT_SECRET);
    const response = makeResponse();
    let passed = false;
    await requireAuth(
      { headers: { cookie: `gwic_session=${token}` } },
      response,
      () => { passed = true; },
    );
    assert.equal(passed, false);
    assert.equal(response.statusCode, 403);
    assert.match(response.body.message, /suspended/i);
  } finally {
    User.findById = originalFindById;
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  }
});

test('transaction restrictions reject new restricted operations', () => {
  const response = makeResponse();
  let passed = false;
  requireTransactionsAllowed(
    { user: { transactionRestricted: true } },
    response,
    () => { passed = true; },
  );
  assert.equal(passed, false);
  assert.equal(response.statusCode, 403);
  assert.match(response.body.message, /transaction access is restricted/i);
});

test('restoring transactions clears the restriction and records the admin reason', async () => {
  const originalStartSession = mongoose.startSession;
  const originalFindById = User.findById;
  const originalAuditSave = AdminAuditLog.prototype.save;
  const targetId = new mongoose.Types.ObjectId();
  const actorId = new mongoose.Types.ObjectId();
  const user = {
    _id: targetId,
    id: targetId.toString(),
    role: 'user',
    transactionRestricted: true,
    transactionRestrictionReason: 'Pending investigation',
    transactionRestrictedAt: new Date('2026-01-01T00:00:00.000Z'),
    transactionRestrictedBy: new mongoose.Types.ObjectId(),
    async save() {},
  };
  let auditEntry;

  mongoose.startSession = async () => ({
    withTransaction: async (operation) => operation(),
    async endSession() {},
  });
  User.findById = () => ({ session: () => user });
  AdminAuditLog.prototype.save = async function save() {
    auditEntry = this;
    return this;
  };

  try {
    const response = makeResponse();
    await updateTransactionRestriction(
      {
        body: { restricted: false, reason: 'Investigation completed' },
        params: { userId: targetId.toString() },
        user: { _id: actorId },
      },
      response,
      (error) => { throw error; },
    );

    assert.equal(response.statusCode, 200);
    assert.equal(user.transactionRestricted, false);
    assert.equal(user.transactionRestrictionReason, '');
    assert.equal(user.transactionRestrictedAt, null);
    assert.equal(user.transactionRestrictedBy, null);
    assert.equal(response.body.user.transactionRestricted, false);
    assert.match(response.body.message, /restored/i);
    assert.equal(auditEntry.action, 'user.transaction_restriction_updated');
    assert.equal(auditEntry.previousStatus, 'restricted');
    assert.equal(auditEntry.nextStatus, 'available');
    assert.equal(auditEntry.note, 'Investigation completed');

    let passed = false;
    requireTransactionsAllowed(
      { user: { transactionRestricted: user.transactionRestricted } },
      makeResponse(),
      () => { passed = true; },
    );
    assert.equal(passed, true);
  } finally {
    mongoose.startSession = originalStartSession;
    User.findById = originalFindById;
    AdminAuditLog.prototype.save = originalAuditSave;
  }
});
