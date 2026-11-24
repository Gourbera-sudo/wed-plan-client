# WedPlan

Role-based wedding planning platform. Couples browse and book wedding services, vendors manage listings and requests, and admins moderate the marketplace.

- **Client:** Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS 4, Base UI, Better Auth) — this repository. The app root is `src/app`, not `app/`.
- **API:** Express + MongoDB (`wed-plan` database) in the sibling `wedplan-server` repository. Better Auth owns sessions; the client exchanges its session cookie for a short-lived JWT via `POST /api/auth/token` before calling the API.

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
| `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` | Session cookies |
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
npm test                               # API smoke test (in wedplan-server)
```

There is no test runner in the client; the typecheck and lint are the closest checks.

## Routes and access

| Area | Routes | Access |
| --- | --- | --- |
| Public | `/`, `/services`, `/sign-in`, `/sign-up` | Everyone (browse requires sign-in) |
| Private | `/dashboard`, `/profile`, `/categories/[slug]`, `/payment/success`, `/payment/cancel` | Signed-in users |
| Customer | `/customer`, `/customer/bookings`, `/customer/profile` | `customer` |
| Vendor | `/vendor`, `/vendor/services`, `/vendor/services/new`, `/vendor/bookings`, `/vendor/subscription`, `/vendor/profile` | `vendor` |
| Admin | `/admin`, `/admin/users`, `/admin/services`, `/admin/transactions` | `admin` |

Role layouts call `requireRole(...)` on the server; a user who edits the URL into another role's area is redirected to `/unauthorized`. Blocked accounts are rejected by both the client guard and every protected API route.

## Subscriptions

Vendors can pay for Premium two ways:

- **Card (Stripe test mode):** checkout redirects back to the client, but activation happens only in the signature-verified webhook.
- **UPI:** the server creates a pending order with a QR/deep link, the vendor submits the UTR, and an admin approves it in `/admin/transactions`. Only that authenticated admin action activates Premium. Success redirects and polling never change the plan.

Configure `UPI_VPA` (and optionally `UPI_PAYEE_NAME`, `UPI_MONTHLY_PAISE` in paise) on the server to enable UPI.

## Deployment

Deploy the client (e.g. Vercel) with all client env vars set, and host the Express API separately with its own env vars. Set `CLIENT_URL` to the deployed client origin, register the Stripe webhook against `https://<api-host>/api/payments/webhook` with `STRIPE_WEBHOOK_SECRET`, and use a reachable `UPI_VPA`. After moderation or listing changes the public cached listings are expired through the `revalidateServices` server action.
