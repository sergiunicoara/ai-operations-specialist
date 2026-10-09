# 03. Supabase login and saving test results

## Goal

Let users create an account and log in, then save every finished test to a
database tied to their account, with **Row Level Security (RLS)** turned on
so a user can only ever see their own results — never anyone else's.

## Outside v0: create the Supabase project

1. In Supabase, create a new project. Pick any name and a strong database
   password (Supabase generates one for you — save it somewhere safe, you
   likely won't need it directly, but don't lose it).
2. Once the project is ready, go to **Project Settings → API**. You'll need
   two values from this page later:
   - The **Project URL**
   - The **anon / public key**
   Leave this tab open.

## Outside v0: create the results table, with RLS on from the start

Go to the Supabase **SQL Editor** and run this:

```sql
create table public.test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wpm numeric not null,
  accuracy numeric not null,
  mode text not null default 'free',
  created_at timestamptz not null default now()
);

alter table public.test_results enable row level security;

create policy "Users can view their own results"
  on public.test_results for select
  using (auth.uid() = user_id);

create policy "Users can insert their own results"
  on public.test_results for insert
  with check (auth.uid() = user_id);
```

Read that middle line again: `enable row level security`. Without it, by
default Supabase would let any logged-in user query every row in this table
— everyone's results, not just their own. The two policies after it are what
actually say "only your own rows": one for reading, one for writing. This is
the single most commonly skipped step in AI-generated Supabase apps —
double-check it's there.

## Connect Supabase to your v0 project

1. In v0, find the Supabase integration (often under project/environment
   settings, or offered directly in chat when you ask for login).
2. Connect it to the Supabase project you just created, using the Project
   URL and anon key from the API settings page.
3. Confirm that v0 adds these as environment variables rather than pasting
   them into a file — v0's Supabase integration normally does this
   automatically. You'll double check this in guide 06.

## v0 prompts

**Prompt 1 — sign up and login**

```
Add email/password sign-up and login using Supabase auth. Include a simple
account menu showing whether the user is logged in, with a logout button.
The typing test itself should still work for logged-out visitors — just
without saving results.
```

**Prompt 2 — save a result when logged in**

```
When a logged-in user finishes a typing test, save the result (wpm,
accuracy, mode) to the "test_results" table in Supabase, tied to their user
id. If the user isn't logged in, skip saving and just show them the result
as before.
```

**Prompt 3 — history page**

```
On the history page, show the logged-in user's past test results from the
"test_results" table, newest first, with date, WPM, accuracy, and mode.
If the user isn't logged in, show a message inviting them to sign up to
save their results, instead of an empty table.
```

## How to check it worked

- [ ] You can sign up with an email and password, and log back in.
- [ ] Finishing a test while logged in adds a row to `test_results` in
      Supabase (check the **Table Editor** in Supabase directly to confirm).
- [ ] The history page shows your own results, newest first.
- [ ] **RLS check**: create a second test account, log in as it, and confirm
      its history page is empty — it must not show the first account's
      results.
- [ ] In Supabase, under **Authentication → Policies** (or **Table Editor →
      test_results → RLS**), confirm RLS shows as **enabled** with both
      policies listed.

## Common problems and fixes

**Sign-up works but nothing gets saved to the table.**
Check the browser console for errors first. A common cause is the insert
running before Supabase confirms the user is logged in — ask v0 to make
sure the save only happens after `user` is confirmed non-null.

**I can see other users' results (or nobody's, including my own).**
This is an RLS policy problem. Go back to the SQL editor and re-run the
`create policy` statements above — a common mistake is enabling RLS but
never adding policies, which blocks all access, or writing a policy with
`using (true)`, which allows all access. The policies above should read
`auth.uid() = user_id`, not `true`.

**"new row violates row-level security policy" error when saving.**
This means the insert is missing the `with check` condition, or the app is
trying to insert a `user_id` that doesn't match the logged-in user's own
id. Ask v0 to confirm it's setting `user_id` from the current session, not
from a form field.

**The anon key looks like a secret — is it safe to expose?**
Yes — the anon key is designed to be used from the browser. It only works
within the boundaries your RLS policies allow. This is exactly why RLS
matters: without it, that public key could read your whole table.
