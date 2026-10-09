# 04. Stripe subscription for the Pro plan

## Goal

Let a user subscribe to a paid monthly "Pro" plan. Everything in this guide
happens in Stripe's **sandbox (test) mode** — no real money moves, and you'll
use a test card number instead of a real one.

This guide sets up checkout and the subscription. The next guide
(05) is what actually unlocks Pro features once someone subscribes — keep
them separate, because the mistake most AI-built apps make is skipping
straight from "payment succeeded" to "unlock features," which guide 05
explains why to avoid.

## Outside v0: confirm you're in test mode

1. Open your Stripe Dashboard. Look for a **test mode** toggle (usually top
   right). Make sure it's switched on for this entire project.
2. Everything you create below — the product, the webhook — needs to be
   created while test mode is on. Stripe keeps test and live data completely
   separate.

## Outside v0: create the Pro product and price

1. In Stripe, go to **Product catalog** and create a new product — name it
   "Pro".
2. Add a **recurring monthly price** to it (any amount — $5, $9, whatever
   you like, it's fake money).
3. Copy the **Price ID** (starts with `price_`) — you'll give this to v0.

## Outside v0: get your API keys

1. In Stripe, go to **Developers → API keys**.
2. Copy the **Publishable key** (starts with `pk_test_`) and the **Secret
   key** (starts with `sk_test_`). Both should say "test" — if they don't,
   you're not in test mode.

The secret key must never appear in any file v0 shows in the browser, and
never get committed to GitHub — only in an environment variable. Guide 06
walks through checking this before you deploy.

## v0 prompts

**Prompt 1 — pricing page and checkout**

```
On the pricing page, add a "Subscribe to Pro" button for logged-in users.
Clicking it should start a Stripe Checkout session for a monthly
subscription, using Stripe's recommended server-side approach (an API route
that creates the Checkout session, rather than doing it from the browser).
Use environment variables for the Stripe secret key and price ID — don't
hardcode them.
```

**Prompt 2 — success and cancel pages**

```
After Stripe Checkout, redirect a successful payment to a "Thanks for
subscribing" page, and a cancelled checkout back to the pricing page. The
success page should not itself grant Pro access — just show a confirmation
message. We'll handle actually unlocking Pro through a separate webhook.
```

Point out that last sentence to v0 explicitly if it tries to set Pro status
directly on the success page — that's the exact shortcut this project
avoids, and guide 05 explains why.

## Outside v0: set up the webhook

A webhook is Stripe calling *your* server to say "this subscription changed"
— it's the only trustworthy way to know someone actually paid, because it
comes from Stripe directly, not from something a user's browser could fake.

1. In Stripe, go to **Developers → Webhooks → Add endpoint**.
2. For local testing, use the [Stripe CLI](https://stripe.com/docs/stripe-cli)
   to forward events to your local dev server — the CLI will print a
   webhook signing secret starting with `whsec_`.
3. Select at least these events: `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
4. Once you deploy in guide 06, come back and add a second, permanent
   endpoint pointed at your live URL (something like
   `https://your-app.vercel.app/api/webhooks/stripe`), and use the signing
   secret Stripe gives you for *that* endpoint.

**v0 prompt — the webhook handler**

```
Create a Stripe webhook API route that listens for checkout.session.completed,
customer.subscription.updated, and customer.subscription.deleted events.
Verify the webhook signature using the Stripe webhook secret from an
environment variable — reject any request that doesn't verify. When a
subscription becomes active, this is where we'll mark the user as Pro in
the database (we'll wire up that database update in the next guide).
```

## How to check it worked

- [ ] The Stripe dashboard shows "TEST MODE" (or equivalent) while you do
      all of this.
- [ ] Clicking "Subscribe to Pro" takes you to a real Stripe Checkout page.
- [ ] Paying with the test card **4242 4242 4242 4242**, any future
      expiry date, any 3-digit CVC, and any billing ZIP succeeds and
      redirects you to your success page.
- [ ] In Stripe, under **Customers**, you see a new test customer with an
      active subscription.
- [ ] Using the Stripe CLI (or the dashboard's webhook logs), confirm the
      `checkout.session.completed` event was delivered to your webhook
      endpoint and returned a success response (status 200).

## Common problems and fixes

**Checkout button does nothing / errors immediately.**
Open the browser console and your server logs. Missing or misnamed
environment variables (secret key, price ID) are the most common cause —
confirm their names exactly match what the API route expects.

**"No signatures found matching the expected signature" on the webhook.**
The webhook secret in your environment variables doesn't match the endpoint
that sent the event. Each Stripe endpoint (your local CLI forwarding vs.
your deployed URL) has its own secret — make sure you're using the one for
whichever endpoint is actually receiving the request.

**Test card is declined.**
Double check you typed `4242 4242 4242 4242` exactly, you're in test mode,
and you used a future expiry date. Stripe also publishes other test cards
for simulating declines and errors deliberately, if you want to test that
path later.

**I don't see the webhook event arrive at all.**
If testing locally, confirm the Stripe CLI is actually running and forwarding
to the right local port. If testing against a deployed app, confirm the
endpoint URL in Stripe's dashboard matches your real deployed URL exactly,
including `https://`.
