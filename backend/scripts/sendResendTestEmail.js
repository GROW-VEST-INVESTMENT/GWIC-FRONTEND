require('dotenv').config();
const { randomUUID } = require('node:crypto');
const { sendResendEmail } = require('../services/resendMailer');

async function main() {
  const to = process.env.RESEND_TEST_TO?.trim();
  if (!to) {
    throw new Error('Set RESEND_TEST_TO in backend/.env to your Resend account email.');
  }
  const { id } = await sendResendEmail({
    to,
    subject: 'Kalma Capital Resend test',
    text: 'This is a test email from the Kalma Capital backend.',
    idempotencyKey: `manual-resend-test/${randomUUID()}`,
  });
  console.log(`Resend accepted the test email. Message ID: ${id}`);
}

main().catch((error) => {
  console.error('Resend test email failed:', error.message);
  process.exitCode = 1;
});
