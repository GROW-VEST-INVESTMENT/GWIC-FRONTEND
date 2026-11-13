const RESEND_API_URL = 'https://api.resend.com/emails';
const EMAIL_PREFERENCES = ['emailAccountUpdates', 'emailSecurityAlerts'];
const DEFAULT_FROM = 'Kalma Capital <onboarding@resend.dev>';

function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function isResendTestMode() {
  return process.env.RESEND_TEST_MODE === 'true';
}

function canSendNotificationEmail(user, preference) {
  if (!EMAIL_PREFERENCES.includes(preference)) {
    throw new Error('Unsupported notification email preference.');
  }
  return user?.notificationPreferences?.[preference] === true;
}

function getNotificationRecipient(user) {
  if (!isResendTestMode()) return user.email;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('RESEND_TEST_MODE must not be enabled in production.');
  }
  const testRecipient = process.env.RESEND_TEST_TO?.trim();
  if (!testRecipient) {
    throw new Error('RESEND_TEST_TO is required when RESEND_TEST_MODE is enabled.');
  }
  return testRecipient;
}

async function sendResendEmail({ to, subject, text, idempotencyKey }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured.');
  if (typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new Error('A valid email recipient is required.');
  }
  if (typeof subject !== 'string' || !subject.trim() || typeof text !== 'string' || !text.trim()) {
    throw new Error('An email subject and text body are required.');
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM,
      to: [to],
      subject: subject.trim(),
      text: text.trim(),
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof result.message === 'string' ? result.message : 'Resend rejected the email.';
    throw new Error(`Resend request failed (${response.status}): ${detail}`);
  }
  if (typeof result.id !== 'string' || !result.id) {
    throw new Error('Resend returned an invalid success response.');
  }
  return { id: result.id };
}

function sendNotificationEmailInBackground(user, {
  preference,
  event,
  subject,
  text,
  idempotencyKey,
}) {
  if (!canSendNotificationEmail(user, preference)) return;
  if (!isResendConfigured()) {
    console.warn(`Resend email skipped for ${event}: RESEND_API_KEY is not configured.`);
    return;
  }

  let recipient;
  try {
    recipient = getNotificationRecipient(user);
  } catch (error) {
    console.error(`Resend email failed for ${event}:`, error.message);
    return;
  }
  if (recipient !== user.email) {
    console.info(`Resend test mode routed ${event} to the configured test recipient.`);
  }
  void sendResendEmail({
    to: recipient,
    subject,
    text,
    idempotencyKey,
  }).then(({ id }) => {
    console.info(`Resend email sent for ${event}. Message ID: ${id}`);
  }).catch((error) => {
    console.error(`Resend email failed for ${event}:`, error.message);
  });
}

module.exports = {
  canSendNotificationEmail,
  getNotificationRecipient,
  isResendConfigured,
  isResendTestMode,
  sendNotificationEmailInBackground,
  sendResendEmail,
};
