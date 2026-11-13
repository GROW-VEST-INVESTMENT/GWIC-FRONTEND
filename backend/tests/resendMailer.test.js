const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  canSendNotificationEmail,
  getNotificationRecipient,
  isResendConfigured,
  sendResendEmail,
} = require('../services/resendMailer');

test('notification emails require the matching user preference to be enabled', () => {
  assert.equal(canSendNotificationEmail({
    notificationPreferences: { emailSecurityAlerts: true },
  }, 'emailSecurityAlerts'), true);
  assert.equal(canSendNotificationEmail({
    notificationPreferences: { emailSecurityAlerts: false },
  }, 'emailSecurityAlerts'), false);
  assert.throws(() => canSendNotificationEmail({}, 'pushNotifications'), /Unsupported/);
});

test('notification test mode redirects only outside production to the configured test recipient', (context) => {
  const originalTestMode = process.env.RESEND_TEST_MODE;
  const originalTestTo = process.env.RESEND_TEST_TO;
  const originalNodeEnv = process.env.NODE_ENV;
  context.after(() => {
    if (originalTestMode === undefined) delete process.env.RESEND_TEST_MODE;
    else process.env.RESEND_TEST_MODE = originalTestMode;
    if (originalTestTo === undefined) delete process.env.RESEND_TEST_TO;
    else process.env.RESEND_TEST_TO = originalTestTo;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  });

  process.env.RESEND_TEST_MODE = 'true';
  process.env.RESEND_TEST_TO = 'tester@example.com';
  process.env.NODE_ENV = 'development';
  assert.equal(getNotificationRecipient({ email: 'customer@example.com' }), 'tester@example.com');

  process.env.NODE_ENV = 'production';
  assert.throws(() => getNotificationRecipient({ email: 'customer@example.com' }), /must not be enabled in production/i);
});

test('Resend sends from the configured backend key and returns its message ID', async (context) => {
  const originalKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.RESEND_FROM_EMAIL;
  const originalFetch = global.fetch;
  context.after(() => {
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
    if (originalFrom === undefined) delete process.env.RESEND_FROM_EMAIL;
    else process.env.RESEND_FROM_EMAIL = originalFrom;
    global.fetch = originalFetch;
  });

  process.env.RESEND_API_KEY = 'test-secret';
  process.env.RESEND_FROM_EMAIL = 'Test <onboarding@resend.dev>';
  let request;
  global.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200, json: async () => ({ id: 'email_test_123' }) };
  };

  assert.equal(isResendConfigured(), true);
  const result = await sendResendEmail({
    to: 'recipient@example.com',
    subject: 'Test',
    text: 'Test message',
    idempotencyKey: 'test-event/123',
  });
  assert.deepEqual(result, { id: 'email_test_123' });
  assert.equal(request.url, 'https://api.resend.com/emails');
  assert.equal(request.options.headers.Authorization, 'Bearer test-secret');
  assert.equal(request.options.headers['Idempotency-Key'], 'test-event/123');
  assert.deepEqual(JSON.parse(request.options.body), {
    from: 'Test <onboarding@resend.dev>',
    to: ['recipient@example.com'],
    subject: 'Test',
    text: 'Test message',
  });
});

test('Resend reports provider failures instead of treating them as successful sends', async (context) => {
  const originalKey = process.env.RESEND_API_KEY;
  const originalFetch = global.fetch;
  context.after(() => {
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
    global.fetch = originalFetch;
  });

  process.env.RESEND_API_KEY = 'test-secret';
  global.fetch = async () => ({
    ok: false,
    status: 403,
    json: async () => ({ message: 'Domain is not verified.' }),
  });
  await assert.rejects(
    sendResendEmail({ to: 'recipient@example.com', subject: 'Test', text: 'Test' }),
    /Resend request failed \(403\): Domain is not verified/,
  );
});
