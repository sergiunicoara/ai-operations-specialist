# typing-test-app

Building a full web app live with AI, from a blank prompt to a deployed URL.
You build a **typing speed test**: free users type a test and see their words
per minute (WPM), accuracy, and a history of past results; users on a paid
Pro plan unlock harder practice modes (punctuation, numbers, symbols, code
snippets).

This folder contains **instructions only** — no starter project, no code
files. You generate every line of code yourself, in [v0](https://v0.app), by
following the guides below in order. A guide is done when you can check the
box at the bottom of it; don't move on until you can.

## What you're building

- **Free tier**: pick a test length, type against common English words,
  see live WPM and accuracy, submit the result, see it added to your history.
- **Pro tier**: a paid monthly subscription that unlocks harder practice
  patterns — punctuation, numbers, symbols, short code snippets — checked and
  enforced on the server, not just hidden in the interface.

## The stack, and what each piece is for

| Tool | What it's for |
| --- | --- |
| [v0](https://v0.app) | An AI tool that generates a Next.js app from a plain-English prompt. This is where you build the interface and most of the logic. |
| [Next.js](https://nextjs.org) | The web framework v0 generates code in — pages, components, and server-side logic all live in one project. You won't hand-write this; you're reading it as v0 builds it. |
| [Supabase](https://supabase.com) | A hosted Postgres database plus login (auth). Stores accounts and every test result. |
| [Stripe](https://stripe.com) | Handles the Pro subscription: checkout, recurring billing, and telling your app when someone's payment status changes. |
| [Vercel](https://vercel.com) | Hosts the finished app on a public URL and rebuilds it every time you push new code. |
| [GitHub](https://github.com) | Where your code lives. v0 pushes there; Vercel deploys from there. |

## Accounts you need before you start

Create all of these first — guide 01 walks through each one:

- A GitHub account
- A v0 account (sign in with GitHub)
- A Supabase account (sign in with GitHub)
- A Stripe account (you'll use **test/sandbox mode** the whole way through —
  no real card, no real money)
- A Vercel account (sign in with GitHub)

Every one of these has a free tier that's enough for this project.

## Guides, in order

Work through these one at a time. Each one says what "done" looks like
before you move to the next.

1. [01_accounts-and-setup.md](01_accounts-and-setup.md) — create every
   account, create the v0 project, connect it to GitHub.
2. [02_typing-test-in-v0.md](02_typing-test-in-v0.md) — build the test
   itself: the word prompt, the timer, and the WPM/accuracy calculation.
3. [03_supabase-login-and-saving-results.md](03_supabase-login-and-saving-results.md) —
   add sign-up/login and save each finished test to a database, with Row
   Level Security so nobody can read anyone else's results.
4. [04_stripe-subscription-for-pro.md](04_stripe-subscription-for-pro.md) —
   add a Pro plan users can subscribe to, in Stripe's sandbox mode.
5. [05_unlocking-pro-patterns.md](05_unlocking-pro-patterns.md) — gate the
   harder practice patterns behind Pro status, checked on the server.
6. [06_deploying-to-vercel.md](06_deploying-to-vercel.md) — put the app on a
   public URL and move every secret key into environment variables.
7. [07_testing-and-troubleshooting.md](07_testing-and-troubleshooting.md) —
   a full end-to-end pass as a free user and as a Pro user, plus fixes for
   the most common ways this project breaks.

[prompts.md](prompts.md) collects every v0 prompt used across the guides
above in one place, in order, so you can copy them without hunting through
each file.

## The big picture

```
v0 (generates the Next.js app from your prompts)
 |
 v
GitHub (v0 pushes code here)
 |
 v
Supabase (accounts + database: test results, subscription status)
 |
 v
Stripe (sandbox checkout + webhook -> marks a user Pro)
 |
 v
Vercel (deploys from GitHub, holds all secret keys)
 |
 v
Your typing test app, live on a public URL
```

## The four things AI-generated apps usually get wrong

Keep an eye out for these across every guide — they're called out again at
the point where each one applies:

- **Row Level Security (RLS)** must be turned on for every table in
  Supabase, so a user can only ever see their own rows.
- **Secret keys** (Supabase service role key, Stripe secret key) live only
  in environment variables — never pasted into a component, never committed
  to Git.
- **Stripe stays in sandbox/test mode** for this whole project — you use the
  test card `4242 4242 4242 4242`, not a real one.
- **Pro status is set by a Stripe webhook**, not by the page a user lands on
  after paying. The success page can be faked by typing its URL directly;
  a webhook call from Stripe's servers cannot.
- **Pro patterns are unlocked on the server**, not just hidden with an
  `if (isPro)` in the interface — otherwise a free user can open dev tools
  and switch it on for themselves.

## No prior experience assumed

If you've never touched Next.js, Supabase, Stripe, or Vercel before, that's
the point of this project. Every guide tells you exactly what to type into
v0 and exactly what to click outside of it. When something doesn't work,
check the "Common problems" section at the bottom of that guide before
asking for help.
