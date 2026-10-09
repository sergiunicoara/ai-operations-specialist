# 07. Testing and troubleshooting

## Goal

Walk through the entire app end-to-end, as both a free user and a Pro user,
on the live deployed URL. This guide doesn't add anything new — it's the
checklist that confirms everything from guides 01–06 actually works
together, plus fixes for the problems that show up most often at this
stage.

## The full walkthrough

Do this on your live Vercel URL, not locally — a deploy can pass every
local check and still break, usually because of environment variables (see
guide 06).

**As a brand new free user:**

1. Sign up with a fresh email you haven't used in this project before.
2. Take a typing test using common words. Confirm WPM and accuracy appear
   and look reasonable for how you actually typed.
3. Check the history page — your result should be there.
4. Try to select a Pro mode (Punctuation, Numbers and symbols, Code
   snippets). Confirm it's locked or prompts you to upgrade.
5. Log out, then log back in. Confirm your history is still there.

**Upgrading to Pro:**

6. Go to the pricing page and subscribe, using the test card
   `4242 4242 4242 4242`, any future expiry date, any 3-digit CVC.
7. After checkout, confirm the success page appears.
8. In Supabase's Table Editor, confirm your `subscriptions` row now shows
   `status = 'active'`. If it doesn't appear right away, wait a few seconds
   and refresh — webhook delivery isn't always instant.
9. Back in the app, confirm the Pro modes are now unlocked, and take a test
   in each one.

**Confirming enforcement, not just appearance:**

10. Open a private/incognito browser window (a clean, logged-out session)
    and sign up with a second, different email — don't subscribe this one.
11. Using this second free account, try to access Pro content directly
    rather than through the normal interface — for example, open your
    browser's developer tools, find the network request the Pro mode makes
    to get its word list, and try repeating that same request. Confirm it
    does not return real Pro content.

**Cancelling:**

12. Back on your first (Pro) account, cancel the subscription — either
    through a "Manage subscription" link in your app (Stripe's Customer
    Portal, if you built one) or directly in the Stripe dashboard under
    that customer.
13. Confirm the webhook fires (check Stripe's webhook logs) and that your
    `subscriptions` row goes back to `status = 'free'`.
14. Confirm Pro modes lock again in the app.

If every step above works, the app is functionally complete for this
project.

## Common problems and fixes

**Results save for me but WPM/accuracy look wrong compared to what I actually typed.**
Manually type a short, known passage slowly and deliberately (e.g., type it
perfectly, note your time), and compare the app's WPM to a hand calculation
using `(correct characters / 5) / minutes`. If they don't match, ask v0 to
show you the calculation and walk through it with your own numbers — see
guide 02's troubleshooting section for the usual causes.

**Everything works for me, but a classmate/friend testing my deployed URL sees errors.**
Ask what browser and whether they're logged in with a fresh account — some
bugs only appear for a brand-new user with an empty history, or only in
browsers with strict cookie/privacy settings that affect Supabase auth
sessions. Reproduce in an incognito window before assuming it's on their
end.

**Subscribing works, but Pro status takes a long time to appear.**
A short delay (a few seconds) between checkout and the webhook updating your
database is normal. If it never arrives, check Stripe's webhook logs for a
failed delivery — see guide 06's troubleshooting for signature errors.

**The app worked yesterday and now shows server errors.**
Check whether a Stripe or Supabase key was rotated (see guide 06) without
updating Vercel's environment variables to match, and check Vercel's
deployment logs for the specific error — it almost always names the exact
missing variable or failed request.

**I want to keep improving this after the course.**
Good next steps, roughly in order of how much they teach you: a "forgot
password" flow, a Stripe Customer Portal link so users can manage or cancel
their own subscription without you touching the dashboard, a leaderboard of
best WPM scores, and multiplayer races between two logged-in users. None of
these are required for this project — they're just natural next features
that reuse everything you've already built.

## What "done" looks like

- [ ] A brand-new free user can sign up, take a test, and see accurate
      results and history.
- [ ] A free user cannot access Pro content, even by bypassing the
      interface directly.
- [ ] Subscribing with the Stripe test card correctly unlocks Pro modes,
      driven by the webhook — not the success page.
- [ ] Cancelling correctly locks Pro modes again.
- [ ] No secret key appears anywhere in your GitHub repository.
