const assert = require('node:assert/strict');
const { test } = require('node:test');
const requireAdmin = require('../middleware/requireAdmin');
const requireAdminOrigin = require('../middleware/requireAdminOrigin');
const {
  reviewVerification,
  updateSupportRequest,
} = require('../controllers/adminOperationsController');

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

test('admin middleware allows staff roles and rejects user accounts', () => {
  for (const role of ['admin', 'super_admin']) {
    let passed = false;
    requireAdmin({ user: { role } }, makeResponse(), () => { passed = true; });
    assert.equal(passed, true);
  }

  for (const user of [undefined, { role: 'user' }]) {
    const response = makeResponse();
    let passed = false;
    requireAdmin({ user }, response, () => { passed = true; });
    assert.equal(passed, false);
    assert.equal(response.statusCode, 403);
  }
});

test('admin write origin must be explicitly trusted', () => {
  const originalEnvironment = {
    adminUrl: process.env.ADMIN_URL,
    corsOrigins: process.env.CORS_ORIGINS,
    nodeEnv: process.env.NODE_ENV,
  };
  process.env.NODE_ENV = 'production';
  process.env.ADMIN_URL = 'https://admin.example.com';
  delete process.env.CORS_ORIGINS;
  try {
    let passed = false;
    requireAdminOrigin({ get: () => 'https://admin.example.com' }, makeResponse(), () => { passed = true; });
    assert.equal(passed, true);

    for (const origin of [undefined, 'https://customer.example.com']) {
      const response = makeResponse();
      requireAdminOrigin({ get: () => origin }, response, () => {});
      assert.equal(response.statusCode, 403);
    }
  } finally {
    if (originalEnvironment.adminUrl === undefined) delete process.env.ADMIN_URL;
    else process.env.ADMIN_URL = originalEnvironment.adminUrl;
    if (originalEnvironment.corsOrigins === undefined) delete process.env.CORS_ORIGINS;
    else process.env.CORS_ORIGINS = originalEnvironment.corsOrigins;
    if (originalEnvironment.nodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalEnvironment.nodeEnv;
  }
});

test('KYC decisions require evidence confirmation and a meaningful reviewer note', async () => {
  for (const body of [
    { decision: 'verified', note: 'Checked documents', evidenceReviewed: false },
    { decision: 'rejected', note: 'No', evidenceReviewed: true },
    { decision: 'pending', note: 'Checked documents', evidenceReviewed: true },
  ]) {
    const response = makeResponse();
    await reviewVerification(
      { body, params: { requestId: '507f1f77bcf86cd799439011' } },
      response,
      (error) => { throw error; },
    );
    assert.equal(response.statusCode, 400);
  }
});

test('support status changes require a valid status and audit note', async () => {
  for (const body of [
    { status: 'closed', note: 'Resolved this' },
    { status: 'resolved', note: '' },
  ]) {
    const response = makeResponse();
    await updateSupportRequest(
      { body, params: { requestId: '507f1f77bcf86cd799439011' } },
      response,
      (error) => { throw error; },
    );
    assert.equal(response.statusCode, 400);
  }
});
