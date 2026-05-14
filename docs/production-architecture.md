# Yomira Production Architecture

## Principle

Ryuzo should not operate Stripe, Vercel, or database dashboards manually.

The product should be run from this repository and chat-driven agent work:

- Vercel hosts the web UI and API.
- Supabase owns auth, users, credits, API keys, and simulation history.
- Stripe owns payments and subscriptions.
- OpenAI runs the simulation model calls.

Mora is only a distribution/sales channel. The core product is Yomira.

## Stack

### Vercel

- Static UI: `/site`
- API: `/api/*`
- Environment variables
- Deployment

### Supabase

Use Supabase for:

- email magic-link login
- users/profiles
- API keys
- credit ledger
- subscriptions/plans
- simulation jobs/results
- admin inspection

Supabase RLS should be enabled on customer-visible tables. Server-side Vercel Functions use the Supabase service role key and never expose it to the browser.

### Stripe

Use Stripe API from Vercel Functions:

- create checkout sessions
- handle webhook events
- update Supabase credits/subscriptions

Do not require Ryuzo to create products or links in the browser. Products/prices can be created by script once Stripe CLI/API credentials exist locally.

## Billing Model

Start with credits and plans, not pure Stripe metered billing.

Plans:

- Starter: $20 one-time, 200 credits
- Pro: $99/month, 1,500 credits/month
- Pro Max: $299/month, 6,000 credits/month

Later:

- add top-up packs
- add auto top-up
- add overage billing for trusted B2B/API customers
- add Stripe Billing Meters if customers want pure usage-based billing

Why not pure usage billing first:

- users need predictable spend
- simulation cost may vary by model and N
- credits are easier to reason about in the UI
- Stripe metered billing is better after usage patterns are known

## Auto Top-Up

Auto top-up is the best first version of "usage-based" billing:

```text
If credit balance falls below threshold
→ charge saved Stripe payment method
→ add a fixed credit pack
```

Recommended defaults:

- threshold: 50 credits
- top-up: $20 / 200 credits
- require explicit opt-in
- email receipt through Stripe
- hard monthly cap later

This is safer than pure metered billing because users know the unit they are buying and can disable auto top-up.

Pure usage billing can come later for teams:

```text
monthly invoice = base plan + metered simulation usage
```

That should wait until simulation cost per N/model is stable.

## User Flow

1. User lands on minimal product page.
2. User logs in with email magic link.
3. User buys Starter/Pro/Pro Max through Stripe Checkout.
4. Stripe webhook grants credits in Supabase.
5. User sees credits in `/admin.html`.
6. User creates/copies API key.
7. User calls:

```http
POST /api/simulate
x-api-key: sim_...
```

8. API estimates credit cost, runs simulation, stores result, deducts credits.

## Simulation Flow

Small N:

```text
POST /api/simulate
→ run synchronously
→ return voices/clusters/result
```

Large N:

```text
POST /api/simulations
→ create job
→ return job_id
→ worker runs batches
→ GET /api/simulations/:id
```

Do not force N=1000 through a single synchronous request as the long-term architecture.

## What Ryuzo Must Do Once

Only one-time login/credential setup:

```bash
npx vercel login
npx supabase login
stripe login
```

If a CLI is not installed, Codex installs it or uses `npx` where possible.

Secrets go in local `.env` and Vercel environment variables, never in chat:

```bash
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PUBLIC_BASE_URL=
REQUIRE_API_KEY=true
```

## Immediate Build Order

1. Supabase credit tables, API keys, ledger, and simulation storage are in place.
2. Stripe Checkout creation and webhook credit grants are in place.
3. API key claim/rotation after checkout is in place.
4. `/api/simulate` requires an API key, deducts credits, and stores completed simulations.
5. Auto top-up settings exist and can charge a saved Stripe payment method when the balance is low.
6. Minimal admin UI exists for checkout, claiming keys, checking balance, and toggling auto top-up.
7. Next: run one real Stripe test-card checkout end to end from the public admin page.
8. Next: add Supabase auth if customers need a login dashboard instead of API-key-only admin.
