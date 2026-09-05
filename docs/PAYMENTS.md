# Turning on payments

Two separate payment paths, one Stripe account:

| What | How money is taken | Who sets it up |
|---|---|---|
| Essay, Careers, CV, CV+Careers bundle | Fledgy's own Stripe Checkout (code in this repo) | Steps 1–3 below |
| Mentor 1:1 sessions | Calendly's Stripe connection (no code) | Step 4 below |

Claude cannot do any of this — every step needs your login, and API keys must
never be pasted into a chat. Do these yourself in the dashboards.

---

## Step 0 — Vercel KV. Do this FIRST.

**Without KV, people can pay and receive nothing.** Entitlements deliberately
fail closed: if the store is unreachable, `hasProduct()` returns false, so a
paying customer is told they haven't paid. Free usage limits fail *open* by
contrast, so the site has worked fine so far without KV — which means it may
never have been connected. Check before taking a single payment.

Vercel → your project → **Storage** → Create Database → **KV** → Connect to
Project. Vercel injects the `KV_*` variables automatically; no code change.

Confirm it works: score a CV twice with the same email. If the second run
still says you have free scores left, KV is not connected.

---

## Step 1 — Stripe API key

Stripe → Developers → API keys.

- **For the preview deploy, use the TEST key** (`sk_test_…`). Card 4242 4242
  4242 4242, any future expiry, any CVC. Nothing real is charged.
- Only switch to the live key (`sk_live_…`) when you're ready to sell.

Vercel → Settings → Environment Variables:

| Name | Value | Environments |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…` | Preview |
| `STRIPE_SECRET_KEY` | `sk_live_…` | Production |

Setting them per-environment is what stops the preview taking real money.
`PRICE_CONFIRMED` is `true` in `src/lib/products.ts`, so a live key means
checkout is live the moment it's deployed.

---

## Step 2 — Webhook

Stripe → Developers → **Webhooks** → Add endpoint.

- URL: `https://fledgy.guide/api/stripe/webhook`
- Event: `checkout.session.completed` (that one only)

Copy the signing secret (`whsec_…`) into Vercel as `STRIPE_WEBHOOK_SECRET`.

The webhook is the reliable path, but the `/unlock` page also verifies the
session with Stripe directly and grants access itself — so a buyer is unlocked
even before this exists. Both call the same idempotent grant, so there's no
double-crediting. Set it up anyway: the return page only fires if the buyer
actually lands back on the site.

---

## Step 3 — Test the full loop

With the test key on the preview deploy:

1. Score a CV, hit the paywall, click Unlock.
2. Pay with 4242 4242 4242 4242.
3. You should land on `/unlock` and see the product confirmed.
4. Go back to `/cv` with the same email — the writer should appear with
   "3 of 3 rewrites left".
5. Generate a CV. It should drop to 2.

If step 4 shows the paywall again, KV isn't connected (see Step 0).

---

## Step 4 — Calendly for mentors

Mentor payments do **not** go through this repo's Stripe code. Calendly
collects them via its own Stripe connection.

1. Upgrade Calendly to a paid plan (paid event types need Standard or above).
2. Calendly → Integrations → **Stripe** → connect. Use **live** Stripe here
   when you're ready to take real bookings.
3. Create three event types, one per mentor:
   - 30 minutes, price **$29**
   - Host = that mentor's own calendar, so availability is theirs
   - Ajit and Hasna each need their own Calendly seat, or their events sit on
     your account and show your availability, not theirs
4. Copy the three public links.
5. Paste each into `bookingUrl` in `src/lib/mentors.ts`.

That last paste is the only code change. The moment a `bookingUrl` is
non-empty, that mentor's button flips from "Request a session" (a mailto) to
"Book a session" pointing at Calendly. Until then the page works as an
enquiry page and takes no money.

### Also fix before the mentors page goes public

- `hasna.email` is empty, so her requests fall back to `hello@fledgy.guide` —
  which is Ajit's mailbox.
- `ajit.email` is `ajitkahlon@gmail.com`, a personal Gmail sitting in a public
  `mailto:` on a page listed in the sitemap. Give him a `@fledgy.guide`
  address instead.
- Confirm Hasna and Ajit have agreed to their name, photo and bio being
  public.

---

## Currency

Everything is charged in **USD**. The rupee figures on the paywalls are
display-only, to make the price legible to the India audience — see
`priceDisplayInr` in `src/lib/products.ts`. No rupee rail exists yet; that
needs Razorpay and an Indian company account.

## Killing all sales quickly

Set `PRICE_CONFIRMED = false` in `src/lib/products.ts` and deploy. Checkout
refuses to create sessions and every paywall switches to a "pricing soon"
state. Faster and safer than pulling keys.
