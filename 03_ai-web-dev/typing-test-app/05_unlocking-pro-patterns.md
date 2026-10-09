# 05. Unlocking Pro patterns for paying users

## Goal

Add the harder practice patterns — punctuation, numbers, symbols, and short
code snippets — and make them available **only** to users with an active
Pro subscription. The check has to happen on the server, not just in the
interface, so a free user can't unlock them by editing the page in their
browser.

## Why this needs to happen on the server

If a Pro toggle only lives in the browser (for example, a button that's
disabled unless `isPro` is `true` in the page's state), anyone can open
their browser's developer tools, flip that value, and see Pro content for
free — no payment required. The interface can *hide* the button, but only
the server can actually *refuse* to hand over Pro content. Both matter: the
interface for a good experience, the server for actual enforcement.

## Outside v0: add a Pro status column, updated only by the webhook

Run this in the Supabase SQL editor:

```sql
create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  status text not null default 'free',
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscription status"
  on public.subscriptions for select
  using (auth.uid() = user_id);
```

Notice there is **no insert/update policy** for regular users here — on
purpose. The only thing allowed to change a row in this table is your
webhook handler, running with Supabase's **service role key** (a separate,
more powerful key that bypasses RLS — this is expected and safe, because it
never runs in the browser, only on your server). If you accidentally added
an update policy that let users set their own `status`, anyone could mark
themselves Pro directly — this table's whole job is to make that
impossible.

## Outside v0: get your Supabase service role key

1. In Supabase, go to **Project Settings → API**.
2. Copy the **service_role key**. This key can read and write anything,
   bypassing RLS entirely — treat it like a master password. It goes in an
   environment variable on your server only, never in any file the browser
   receives, never in Git.

## v0 prompts

**Prompt 1 — wire the webhook to the subscriptions table**

```
Update the Stripe webhook handler so that when checkout.session.completed
or customer.subscription.updated fires with an active subscription, it
uses the Supabase service role key (server-side only, from an environment
variable) to set that user's row in the "subscriptions" table to
status = 'active'. When customer.subscription.deleted fires, or the
subscription status is no longer active, set it back to status = 'free'.
Match the Stripe customer to the Supabase user via the stripe_customer_id
column.
```

**Prompt 2 — the harder practice patterns**

```
Add three new typing test modes alongside the existing common-words mode:
"Punctuation" (words with commas, periods, and quotation marks mixed in),
"Numbers and symbols" (words mixed with digits and symbols like % # @),
and "Code snippets" (short realistic lines of code in a common language).
Let the user pick a mode before starting a test.
```

**Prompt 3 — server-side gating**

```
Restrict the Punctuation, Numbers and symbols, and Code snippets modes to
users whose subscription status is "active" in the "subscriptions" table.
Check this on the server before returning the test content for these
modes — not just by hiding the option in the interface. A logged-out or
free user who somehow requests one of these modes directly should get
common words instead, or a clear "Pro required" response, never the actual
Pro content.
```

## How to check it worked

- [ ] As a free (non-subscribed) account, the Pro modes are visibly locked
      or marked "Pro" in the interface.
- [ ] Subscribe using the test card from guide 04, then confirm the
      `subscriptions` table shows `status = 'active'` for your account.
- [ ] As that now-Pro account, you can select and take a Punctuation,
      Numbers and symbols, or Code snippets test.
- [ ] **The real test**: while logged in as a free account, try to reach the
      Pro test content directly — for example, open your browser's
      developer tools/network tab and see what the server actually returns
      when a Pro mode is requested. Confirm it does not return real Pro
      content to a free account, even if you try to call the underlying
      request directly rather than clicking through the interface.
- [ ] Cancel the test subscription in Stripe (or wait for the webhook to
      mark it inactive) and confirm Pro modes lock again.

## Common problems and fixes

**Subscribing doesn't update the subscriptions table.**
Check your webhook logs in Stripe first — confirm the event actually
arrived and returned success. If it did, the bug is likely in how the
webhook matches a Stripe customer to a Supabase user; make sure
`stripe_customer_id` is being saved on the very first checkout and used to
look up the right row afterward.

**A free account can still see Pro content in the interface.**
This is the interface-only mistake this guide exists to catch. Ask v0
directly: "Pro mode content should never be sent to the browser for a
non-Pro user, even before they click anything — check on the server, not
just in a conditional render." Ask it to show you where the mode's word
list is generated, and confirm that code checks subscription status before
generating anything, not after.

**Everything looks locked, even for a Pro account.**
Double-check the webhook is using the **service role** key, not the anon
key, for this update — the anon key is blocked by RLS from writing to this
table (correctly — see above), so it will silently fail to update anyone's
status if used here by mistake.

**I want to test both free and Pro without paying twice.**
Use two different Stripe test accounts (two different test emails), or
manually toggle a row's `status` in the Supabase Table Editor for quick UI
checks — just make sure you rely on a real webhook-driven update at least
once during your final check.
