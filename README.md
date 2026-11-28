# WedPlan — Wedding Planning Platform

Role-based wedding planning platform. Couples browse and book wedding services, vendors manage listings and requests, and admins moderate the marketplace.

- **Client repository:** <https://github.com/Gourbera-sudo/wed-plan-client.git> — this repository.
- **Server repository:** <https://github.com/Gourbera-sudo/wedplan-server.git>
- **Live website:** <https://wedplan-client-brown.vercel.app>
- **Live API health check:** <https://wedplan-server-teal.vercel.app/api/health>

## Important features

- Public, role-aware browsing: guests can search by name, filter by category/location, sort by price, and open category pages; service details and booking require sign-in.
- Better Auth email/password and Google/GitHub sign-in, role selection at sign-up, blocked-account lockout, and role-specific dashboards guarded on the server.
- Vendor listing CRUD with availability controls, pending admin review, a 3-active-listing free cap, and booking-request accept/reject.
- Customer booking requests with duplicate/self-booking rules written through the Express API, trackable status, and a full-details dialog.
- Admin user management (detail view, block/unblock, role and business-name changes — no plan grants), service moderation (approve/reject/pause/delete), stats, and a transaction ledger with vendor identity and UPI verification.
- Premium subscriptions via vendor-only Stripe Checkout (idempotent, signature-verified webhook activation; refunds and cancellations revoke access) and UPI (admin verification only). Expired premium automatically falls back to the free plan.
- ImgBB image uploads through server-side proxy endpoints; no API keys are exposed to the browser.
- Reusable Base UI/shadcn primitives for accessible dialogs and destructive confirmations, plus custom 404 and error pages.

## Technology stack

Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS 4, shadcn base-nova primitives on Base UI, Better Auth, MongoDB, Motion, and an Express + MongoDB REST API with JWT authorization and Stripe.

## Getting started

Requires Node.js 20+ and a MongoDB connection (local or Atlas).

```bash
# Client
cp .env.example .env
npm install
npm run dev             # http://localhost:3000

# API (in ../wedplan-server)
cp .env.example .env
npm install
npm start               # http://localhost:8000
```

`JWT_SECRET` and `BETTER_AUTH_SECRET` must have the same value in both `.env` files so each service can verify the other's tokens. `CLIENT_URL` on the server must match the client origin for CORS and Stripe redirects.

### Client environment

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Shared MongoDB connection (Better Auth + cached service reads) |
| `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` | Session cookies and Better Auth base URL |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Comma-separated browser origins Better Auth accepts (must include the deployed client origin) |
| `JWT_SECRET` | Signs the same-origin API JWT used by browser API calls |
| `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET` | Optional social sign-in |
| `ADMIN_EMAILS`, `VENDOR_EMAILS` | Comma-separated emails promoted on sign-up; admin cannot be self-assigned |
| `IMGBB_API_KEY` | Server-side image uploads via `/api/upload/image` |
| `NEXT_PUBLIC_API_URL` | Express API origin (default `http://localhost:8000`) |

### Server environment

`MONGODB_URI`, `JWT_SECRET`, and `BETTER_AUTH_SECRET` are required. Optional: `PORT`, `CLIENT_URL`, `JWT_EXPIRES_IN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `IMGBB_API_KEY`, `UPI_VPA`, `UPI_PAYEE_NAME`, `UPI_MONTHLY_PAISE`.

## Scripts

```bash
npx next typegen && npx tsc --noEmit   # typecheck (typegen must run first)
npm run lint                           # ESLint 9 flat config
npm run build && npm start             # production build/serve
npm run seed:services                  # curated homepage listings (client)
```

There is no test runner in the client; the typecheck and lint are the closest checks.
The API smoke suite lives in the server repository (`cd ../wedplan-server && npm test`).

## Routes and access

| Area | Routes | Access |
| --- | --- | --- |
| Public | `/`, `/services`, `/categories/[slug]`, `/sign-in`, `/sign-up` | Everyone; service details and booking still require sign-in |
| Private | `/dashboard`, `/profile`, `/payment/success`, `/payment/cancel` | Signed-in users |
| Customer | `/customer`, `/customer/bookings`, `/customer/profile` | `customer` |
| Vendor | `/vendor`, `/vendor/services`, `/vendor/services/new`, `/vendor/services/[id]/edit`, `/vendor/bookings`, `/vendor/subscription`, `/vendor/profile` | `vendor` |
| Admin | `/admin`, `/admin/users`, `/admin/services`, `/admin/transactions`, `/admin/profile` | `admin` |

Role layouts call `requireRole(...)` on the server; a user who edits the URL into another role's area is redirected to `/unauthorized`. Blocked accounts are rejected by both the client guard and every protected API route.

## Subscriptions

Vendors can pay for Premium two ways:

- **Card (Stripe test mode):** checkout redirects back to the client, but activation happens only in the signature-verified webhook after Stripe reports the payment as paid. `/payment/success` reads `/api/payments/status` to show the verified state instead of trusting the redirect. Webhook redeliveries are idempotent, and refunds/disputes/cancellations revoke Premium.
- **UPI:** the server creates a pending order with a QR/deep link, the vendor submits the UTR, and an admin approves it in `/admin/transactions`. Only that authenticated admin action activates Premium. Success redirects and polling never change the plan.

Premium runs for 30 days. Only a verified Stripe webhook or an authenticated admin UPI verification can grant it; expired plans fall back to the free-plan limit (the 3-listing cap applies again). Configure `UPI_VPA` (and optionally `UPI_PAYEE_NAME`, `UPI_MONTHLY_PAISE` in paise) on the server to enable UPI.

## Deployment

The live client is deployed on Vercel as `wedplan-client` with the Next.js preset, Function Region `iad1`, and Deployment Protection disabled. The production `NEXT_PUBLIC_API_URL` is `https://wedplan-server-teal.vercel.app`; the API's `CLIENT_URL` is this live client origin. `MONGODB_URI`, `JWT_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`, `ADMIN_EMAILS`, and `VENDOR_EMAILS` are set in the Vercel project. `BETTER_AUTH_TRUSTED_ORIGINS` must include the deployed client origin, otherwise browsers receive `Invalid origin` on sign-in/sign-up. Google/GitHub and ImgBB credentials are optional in this demo; without them those features stay hidden or return a clear `503`.

The browser signs in with Better Auth on the client domain. The same-origin `/api/auth/token` route reads that session and signs a short-lived HS256 JWT with the shared `JWT_SECRET`; the Express API verifies that JWT, so authentication survives cross-domain hosting and hard refreshes. Register the Stripe webhook at `https://wedplan-server-teal.vercel.app/api/payments/webhook` with `STRIPE_WEBHOOK_SECRET`, and set a reachable `UPI_VPA` to enable UPI. After moderation or listing changes, the cached public listings are expired through the `revalidateServices` server action.

To reproduce the deployment, create a Vercel project for this repo, set the env vars above, keep the region at `iad1` (same as the API and MongoDB egress), then run `vercel --prod`. Verify the home page, `/services`, `/categories/wedding-venues`, a hard-refreshed role dashboard, and `/api/auth/token` (which should return `401` for guests).
