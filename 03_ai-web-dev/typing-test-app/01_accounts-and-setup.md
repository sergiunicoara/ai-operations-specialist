# 01. Accounts and setup

## Goal

Create every account this project needs, and create the v0 project you'll
build in for the rest of these guides. Nothing about the typing test itself
happens in this guide — it's all plumbing, once.

## Outside v0: create your accounts

Do these in order. Use the same email for all of them if you can — it makes
"which login did I use here" a non-issue later.

1. **GitHub** — go to [github.com](https://github.com) and sign up if you
   don't have an account. This is where your app's code will live.
2. **v0** — go to [v0.app](https://v0.app) and sign in with your GitHub
   account. This is where you'll build the app.
3. **Supabase** — go to [supabase.com](https://supabase.com) and sign in
   with GitHub. This will be your database and login system.
4. **Stripe** — go to [stripe.com](https://stripe.com) and create an
   account. When asked, you can skip business details for now — you'll be
   working entirely in **test mode**, which needs no real business
   information to use.
5. **Vercel** — go to [vercel.com](https://vercel.com) and sign in with
   GitHub. This is where the finished app will be hosted.

Keep a browser tab open for each of these — you'll bounce between them
throughout this project.

## Create the v0 project

1. In v0, start a new project.
2. Use your first prompt to describe the whole app at a high level, so v0
   scaffolds something sensible from the start. Don't worry about getting
   every detail right — you'll refine it feature by feature in the guides
   that follow.

**v0 prompt:**

```
Create a typing speed test web app called TypeRush, built with Next.js.
Free users can take a typing test, see their words-per-minute and accuracy,
and view a history of past results. There's also a paid "Pro" plan that
unlocks harder practice modes with punctuation, numbers, symbols, and code
snippets. For now, just create the basic page structure: a home page with
the typing test area, a results/history page, and a pricing page comparing
Free and Pro. No login or payment logic yet — we'll add those next.
```

3. Let v0 generate the project and preview it. You should see a home page,
   a (currently empty) history page, and a pricing page.

## Connect the project to GitHub

1. In v0, find the option to push the project to GitHub (usually a "Push to
   GitHub" or similar button near the project name).
2. Create a new repository for it — a name like `typing-test-app` is fine.
3. Confirm the push, then check GitHub itself: you should see a new
   repository containing a Next.js project.

From here on, every change you make in v0 will push new commits to this
same repository.

## How to check it worked

- [ ] You can sign in to v0, Supabase, Stripe, and Vercel, all with the
      same GitHub account.
- [ ] Your v0 project shows a home page, a history page, and a pricing
      page.
- [ ] Your GitHub account has a new repository with the project's code in
      it, and it updates when you make changes in v0.

## Common problems and fixes

**v0 won't let me push to GitHub.**
Make sure you signed into v0 with GitHub (not email) — the push feature
needs that connection. If you signed up with email, look for an option to
link a GitHub account in your v0 account settings.

**Stripe is asking for business/tax details I don't have.**
You don't need them yet. Look for a way to skip or "finish later" — you can
fully build and test this project in Stripe's sandbox without a completed
business profile. You'll only need real details if you ever want to accept
real payments.

**I don't see a "push to GitHub" option in v0.**
This is sometimes under a project settings menu rather than the main
toolbar. If you truly can't find it, note it and come back after guide 02 —
some v0 plans reveal it once the project has a bit more content.
