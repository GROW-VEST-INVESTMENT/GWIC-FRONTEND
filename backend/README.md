# Kalma Capital backend

## Paystack wallet setup

Configure `PAYSTACK_SECRET_KEY` as a secret in the backend environment. Use a Paystack test secret for sandbox testing; use a live secret only when ready to process real money. Never add either key to source control or frontend environment variables.

Set `FRONTEND_URL` to the deployed frontend origin so Paystack can return users to the dashboard after checkout.

Deposits use Paystack's hosted checkout: the backend initializes the transaction with its secret key and redirects the customer to Paystack's authorization URL. This flow does not need a Paystack public key in the frontend. A public key is only needed if the product later switches to Paystack Inline; it must never be treated as proof of payment. The wallet is credited only by server-side verification, not by a client balance value or a browser success screen.

For the local frontend, `frontend/.env.local` may set `VITE_API_URL=http://localhost:5000`; Vite uses this only as its development API proxy. No Paystack key belongs in frontend environment variables for the hosted-checkout flow.

On Render, configure `MONGODB_URI`, a unique `JWT_SECRET` of at least 32 characters, `PAYSTACK_SECRET_KEY`, and `FRONTEND_URL=https://kalmacapital.com`. Set `ADMIN_URL` to the exact admin frontend origin when applicable. The Kalma Capital production domains are allowed by default; add any other trusted frontend or preview origin explicitly to `CORS_ORIGINS`. Never use a default or shared admin password. Keep `PAYSTACK_SECRET_KEY` on the backend and use the test key while sandbox testing. Render supplies `PORT`; `NODE_ENV` should be `production`. Set `CORE_SAVINGS_ENABLED=false` unless the product has been formally approved for activation. `ACCOUNT_REVIEW_TOKEN` and the three Cloudinary variables are optional and should only be set when those features are in use. See `backend/.env.example` for the variable list.

Configure this webhook URL in the Paystack dashboard:

```text
https://gwic-backend.onrender.com/api/paystack/webhook
```

The endpoint verifies Paystack's HMAC signature and handles `charge.success`, `transfer.success`, `transfer.failed`, and `transfer.reversed` events. Keep it publicly reachable over HTTPS.

### Admin account access

The authenticated admin profile endpoint is `GET /api/admin/users/:userId`. Freeze or restore a regular user's account with `PATCH /api/admin/users/:userId/account-status` and `{ "status": "suspended" | "active", "reason": "..." }`. Admin write requests require a trusted admin origin and a reason between 3 and 500 characters. Each change is audit-logged and increments the user's session version; suspended users cannot sign in or use existing authenticated sessions. Freezing does not alter wallet balances or existing investment plans.

Deposits are limited to ₦100–₦1,000,000 per transaction. Wallet funds are credited only after the backend verifies a successful Paystack transaction. Withdrawals require at least ₦100, sufficient confirmed wallet funds, and a resolved Nigerian bank account whose holder name matches the user's profile name (case, spaces, and punctuation ignored). Withdrawals are sent from the business Paystack balance; failed or reversed transfers are returned to the wallet.

Paystack can require approval for transfers depending on the account's transfer security settings. In that case, the withdrawal remains reserved and pending until Paystack reports a final transfer event.

The authenticated `GET /api/wallet/transactions?page=1&type=all` endpoint returns wallet activity newest-first in pages of 20. `type` accepts `all`, `deposit`, or `withdrawal`; the response includes `total` and `hasMore` for pagination.

### Customer notification inbox and delivery

The authenticated `GET /api/notifications` endpoint returns the signed-in customer's in-app inbox. The customer app can mark one item read with `PATCH /api/notifications/:notificationId/read` or all current items read with `PATCH /api/notifications/read-all`. These records are scoped to the authenticated user. Wallet deposit confirmation creates an in-app notification.

`emailAccountUpdates`, `emailSecurityAlerts`, `pushNotifications`, and the selected notification sound are persisted as customer preferences. Resend sends account welcome, confirmed deposit, and password-change emails when the matching email preference is enabled. For a restricted test, set `RESEND_API_KEY` and `RESEND_TEST_TO` in this backend's ignored `.env` file and run `npm run email:test`. Set `RESEND_TEST_MODE=true` only for local testing to route app-triggered mail to Resend's allowed test recipient; it is rejected in production and should be disabled afterward. The default `onboarding@resend.dev` sender is not for unrestricted customer delivery; production sending requires a verified domain and `RESEND_FROM_EMAIL` set to an address on that domain. Keep the key only in backend environment settings. Delivery failures are logged and do not reverse a successful account or wallet action. The mobile app plays its selected local sound for newly received inbox items while foregrounded; OS push delivery and background sound are not implemented. The admin panel does not configure providers, but could later manage approved templates or delivery status without exposing credentials.

The authenticated `GET /api/portfolio` endpoint summarizes a user's current wallet balance, active Core savings plans, and balances saved toward user-created savings goals. Savings-goal balances are included in the portfolio total and reported separately from the available wallet balance. The endpoint reports current account allocation and accrued yield only; historical performance and securities holdings are not represented because those products and market-data feeds are not integrated.

## Core savings operations

Core Target (12% annual customer yield, 30–60 days) and Core Lock (15%, 90–365 days) are implemented as authenticated investment plans. Amounts are posted in integer kobo and plan creation, wallet debits, and ledger postings use MongoDB transactions. Starting a plan requires a verified user account, sufficient wallet balance, and a UUID v4 idempotency key. `isKycVerified` defaults to `false`; do not set it from a client request. The backend does not collect or store BVNs. Connect a compliant identity-verification provider before enabling customer onboarding.

Core Flex is intentionally unavailable and has no withdrawal endpoint because an instant-access reserve or committed liquidity facility has not been implemented. Early liquidation of locked plans requires password confirmation and returns principal minus the greater of the 3.5% principal penalty or accrued yield; all accrued yield is forfeited. Maturity returns principal and recorded yield to the wallet.

`CORE_SAVINGS_ENABLED` defaults to `false`. Keep it disabled until asset placement/custody, reconciliation, operational funding, legal disclosures, KYC verification, and production controls are ready. The current backend records the yield and spread accruals in its ledger; it does not itself purchase or settle T-Bills, commercial paper, or fund units. Do not enable plans based only on this internal ledger. Before enabling plans, run `npm run wallet:reconcile-opening-balances` once to bring existing wallet balances into the double-entry ledger; review the resulting opening-balance entries with Finance.

The API starts a UTC-midnight scheduler after connecting to MongoDB; it also runs a catch-up sweep at startup and retries failures every five minutes. The sweep is idempotent and catches up missed UTC days. `npm run core-savings:daily` is also available for a dedicated scheduled job or manual operations; do not configure both unless you intend to run a redundant, idempotent sweep. MongoDB must run as a replica set because wallet and investment changes require transactions. Monitor scheduler logs and reconcile ledger balances before enabling customer plans. The endpoint is `GET /api/core-savings`; create plans with `POST /api/core-savings/plans`, and early-liquidate with `POST /api/core-savings/plans/:planId/liquidate`.

## Account settings and support

Signup requires at least a first and last name. Tell users to enter their full legal name as it appears on bank and identity records: bank withdrawals are rejected when the verified bank-account holder name does not match the Kalma Capital profile name. The name is immutable through the regular profile endpoint; users can submit a support request for a correction.

Optional profile photos are uploaded through the authenticated `/api/account/profile/photo` route and stored as authenticated Cloudinary images. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in the backend environment. Only PNG, JPEG, and WebP files under 2 MB are accepted. The API returns a signed image URL; photos are not identity evidence and must not be used for face verification. `DELETE /api/account/profile/photo` removes the current profile photo.

The authenticated `/api/account` routes power the More page:

- `GET/PATCH /profile` reads the account name and updates the phone. The legal account name is fixed after signup; correction requests must go through support. Email changes are not supported by this endpoint.
- `GET/PATCH /preferences` persists wallet-balance visibility and the available display preferences.
- `GET/PATCH /notifications` persists the user's choices. Email and push delivery are not integrated yet; saving a choice does not send a notification.
- `PATCH /password` verifies the current password, changes it, invalidates prior sessions, and clears the current session cookie.
- `GET/POST /verification` reads or submits a manual verification request. It collects legal name and date of birth, not BVN or identity-document numbers. A request is not proof of verification; a reviewer must validate it separately before account KYC status changes.
- `GET/POST /banks`, `PATCH /banks/:bankId/default`, and `DELETE /banks/:bankId` manage up to three verified payout recipients. Linking requires Paystack configuration, password confirmation, and a holder name matching the Kalma Capital profile. Plain account numbers are not stored; only masked details and a provider recipient reference are retained. A linked account can be selected for wallet withdrawals.
- `GET/POST /support` lists and creates support tickets. Staff can update ticket status through the authenticated admin operations API; email delivery is not integrated.
- `GET /about` returns the product information shown in More.

The admin app uses the HttpOnly login session and backend-enforced `admin`/`super_admin` roles; it does not use or expose `ACCOUNT_REVIEW_TOKEN`. Configure `ADMIN_URL` as the exact deployed admin origin. New admin writes also require an approved `Origin`, with production origins taken from `ADMIN_URL` and `CORS_ORIGINS`.

The authenticated staff operations routes are under `/api/admin/operations`:

- `GET /wallets` returns current wallet totals and up to 100 recent wallet records; wallet changes are not exposed.
- `GET /verification-requests?status=pending` lists submitted requests and status counts. `PATCH /verification-requests/:requestId` accepts `verified` or `rejected` only with an evidence-review confirmation and staff note. The request stores legal name and date of birth, not identity documents; staff must verify evidence through the approved secure process before deciding.
- `GET /support-requests?status=all` lists customer tickets. `PATCH /support-requests/:requestId` updates the status with a required staff note.
- `GET /audit-logs` returns the latest KYC and support actions. Review decisions, notes, status changes, and audit entries are written together in a MongoDB transaction.

The legacy `/api/account-review` token routes remain available to trusted server-side tooling. Keep `ACCOUNT_REVIEW_TOKEN` out of browser code and rotate it outside source control.
