# v0 prompts, in one place

Every v0 prompt used across the guides, in the order you'll use them. Each
one is explained in context in its guide — this file exists so you can copy
and paste without hunting through each one. Paste them one at a time, in
order, and let each finish before moving to the next.

## 01. Accounts and setup

```
Create a typing speed test web app called TypeRush, built with Next.js.
Free users can take a typing test, see their words-per-minute and accuracy,
and view a history of past results. There's also a paid "Pro" plan that
unlocks harder practice modes with punctuation, numbers, symbols, and code
snippets. For now, just create the basic page structure: a home page with
the typing test area, a results/history page, and a pricing page comparing
Free and Pro. No login or payment logic yet — we'll add those next.
```

## 02. The typing test in v0

```
On the home page, generate a typing test made of 30 common English words
chosen randomly from a fixed word list (things like "the", "world", "quick",
"about" — everyday words, no punctuation or numbers). Display the words as
plain text. Below or over it, let the user type into a text input, and
highlight each word green as it's typed correctly and red if it's typed
incorrectly, character by character.
```

```
Add a 30-second countdown timer to the typing test. The timer starts on the
user's first keystroke, not on page load. When it reaches zero, the test
ends automatically: stop accepting input and show a "time's up" state.
```

```
When the typing test ends, calculate and display:
- Words per minute (WPM), using the standard definition: (correct
  characters typed / 5) / (time in minutes).
- Accuracy, as the percentage of typed characters that were correct out of
  all characters typed, including mistakes.
Show both numbers clearly on a results screen, along with a "Try again"
button that starts a new test with a fresh set of random words.
```

```
Add a way to restart the test at any time before it finishes, not just from
the results screen — for example a visible "Restart" button near the
typing area. Restarting picks a new random set of words and resets the
timer.
```

## 03. Supabase login and saving test results

```
Add email/password sign-up and login using Supabase auth. Include a simple
account menu showing whether the user is logged in, with a logout button.
The typing test itself should still work for logged-out visitors — just
without saving results.
```

```
When a logged-in user finishes a typing test, save the result (wpm,
accuracy, mode) to the "test_results" table in Supabase, tied to their user
id. If the user isn't logged in, skip saving and just show them the result
as before.
```

```
On the history page, show the logged-in user's past test results from the
"test_results" table, newest first, with date, WPM, accuracy, and mode.
If the user isn't logged in, show a message inviting them to sign up to
save their results, instead of an empty table.
```

## 04. Stripe subscription for the Pro plan

```
On the pricing page, add a "Subscribe to Pro" button for logged-in users.
Clicking it should start a Stripe Checkout session for a monthly
subscription, using Stripe's recommended server-side approach (an API route
that creates the Checkout session, rather than doing it from the browser).
Use environment variables for the Stripe secret key and price ID — don't
hardcode them.
```

```
After Stripe Checkout, redirect a successful payment to a "Thanks for
subscribing" page, and a cancelled checkout back to the pricing page. The
success page should not itself grant Pro access — just show a confirmation
message. We'll handle actually unlocking Pro through a separate webhook.
```

```
Create a Stripe webhook API route that listens for checkout.session.completed,
customer.subscription.updated, and customer.subscription.deleted events.
Verify the webhook signature using the Stripe webhook secret from an
environment variable — reject any request that doesn't verify. When a
subscription becomes active, this is where we'll mark the user as Pro in
the database (we'll wire up that database update in the next guide).
```

## 05. Unlocking Pro patterns for paying users

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

```
Add three new typing test modes alongside the existing common-words mode:
"Punctuation" (words with commas, periods, and quotation marks mixed in),
"Numbers and symbols" (words mixed with digits and symbols like % # @),
and "Code snippets" (short realistic lines of code in a common language).
Let the user pick a mode before starting a test.
```

```
Restrict the Punctuation, Numbers and symbols, and Code snippets modes to
users whose subscription status is "active" in the "subscriptions" table.
Check this on the server before returning the test content for these
modes — not just by hiding the option in the interface. A logged-out or
free user who somehow requests one of these modes directly should get
common words instead, or a clear "Pro required" response, never the actual
Pro content.
```

## 06 and 07

No v0 prompts — these guides are deployment and testing, done outside v0.
