# 06. Deploying to Vercel

## Goal

Put the app on a public URL, and make sure every secret key it uses lives
only in environment variables on the server — never in a file, never in
Git.

## Outside v0: check your code for exposed secrets, first

Before deploying, check what's actually in your GitHub repository:

1. Open your repository on GitHub in the browser.
2. Use GitHub's search (press `/` or use the search bar) scoped to your
   repo, and search for `sk_` (the start of any Stripe secret key) and
   `service_role` (part of the Supabase service role key name). Neither
   search should return a match inside your actual code files.
3. Check that a `.env` or `.env.local` file — if one exists in your project
   — is listed in `.gitignore` and does **not** appear in the repository's
   file list on GitHub. If it does appear, treat every key inside it as
   compromised: rotate (regenerate) that key in Stripe and Supabase before
   continuing, since anyone who saw the repo could have copied it.

Keys that are safe to appear in code: the Supabase **Project URL** and
**anon key**, and the Stripe **publishable key** — these are meant to run in
the browser. Keys that must never appear in code: the Supabase **service
role key** and the Stripe **secret key** and **webhook signing secret**.

## Outside v0: deploy to Vercel

1. In Vercel, create a new project and import your GitHub repository.
2. Vercel will detect it's a Next.js project automatically.
3. Before the first deploy finishes setting up, go to the project's
   **Environment Variables** settings and add every key your app needs:

   | Variable | Value comes from |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
   | `STRIPE_SECRET_KEY` | Stripe → Developers → API keys |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys |
   | `STRIPE_PRICE_ID` | Stripe → your Pro product |
   | `STRIPE_WEBHOOK_SECRET` | Stripe → the webhook endpoint you create below |

   Variable names may differ slightly depending on what v0 called them in
   your code — check your API routes for the exact names they read, and
   match those exactly.
4. Deploy. Vercel gives you a URL like `https://your-app.vercel.app`.

## Outside v0: point Stripe's webhook at your live URL

Guide 04 set up a webhook for local testing via the Stripe CLI. Now that
you have a real URL, add a permanent one:

1. In Stripe, go to **Developers → Webhooks → Add endpoint**.
2. Use `https://your-app.vercel.app/api/webhooks/stripe` (matching whatever
   path your webhook route actually uses).
3. Select the same events as before: `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
4. Copy the signing secret Stripe shows for this specific endpoint, and set
   it as `STRIPE_WEBHOOK_SECRET` in Vercel's environment variables — this is
   a different secret from the one the Stripe CLI gave you locally.
5. Redeploy (or trigger a redeploy) so the new environment variable takes
   effect.

## How to check it worked

- [ ] Your app loads at its public Vercel URL, not just locally.
- [ ] You can sign up, log in, and take a typing test on the live URL.
- [ ] A logged-in user's test result on the live site shows up in Supabase's
      Table Editor.
- [ ] Subscribing with the test card on the live URL succeeds, and the
      **live** webhook endpoint (check Stripe's webhook logs, not the CLI)
      shows a successful delivery.
- [ ] GitHub search for `sk_` and `service_role` across your repository
      returns no matches in code.

## Common problems and fixes

**The deployed site shows errors that didn't happen locally.**
This is almost always a missing or misnamed environment variable in
Vercel — locally, v0's dev environment may have had them set differently.
Check Vercel's deployment logs for the exact error, and compare the
variable names there against what your API routes expect.

**Login/database works locally but not on the deployed site.**
Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are
set in Vercel exactly as they appear in Supabase — a trailing slash or typo
in the URL is a common cause.

**Stripe webhook events show as failed in the dashboard.**
Click into a failed event in Stripe's webhook logs — it shows the exact
response your server returned. A signature verification failure almost
always means `STRIPE_WEBHOOK_SECRET` in Vercel doesn't match the secret for
that specific endpoint (not the CLI's local secret).

**I found a secret key in my GitHub repo.**
Rotate it immediately: generate a new key in Stripe or Supabase, update it
in Vercel's environment variables, and redeploy. The old key should be
treated as public from the moment it was pushed, even if you delete the
commit afterward — Git history keeps old commits unless you rewrite it,
and the key may already have been crawled once public.
