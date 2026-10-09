# 02. The typing test in v0

## Goal

Build the actual typing test: a passage of common words, a timer, live
tracking of what's typed correctly, and a results screen showing WPM and
accuracy. No login and no database yet — the test works, but nothing is
saved.

## v0 prompts

Add these one at a time. Let each one finish and preview before moving to
the next — it's much easier to fix one feature than three at once.

**Prompt 1 — the word prompt and typing area**

```
On the home page, generate a typing test made of 30 common English words
chosen randomly from a fixed word list (things like "the", "world", "quick",
"about" — everyday words, no punctuation or numbers). Display the words as
plain text. Below or over it, let the user type into a text input, and
highlight each word green as it's typed correctly and red if it's typed
incorrectly, character by character.
```

**Prompt 2 — the timer and starting condition**

```
Add a 30-second countdown timer to the typing test. The timer starts on the
user's first keystroke, not on page load. When it reaches zero, the test
ends automatically: stop accepting input and show a "time's up" state.
```

**Prompt 3 — WPM and accuracy calculation**

```
When the typing test ends, calculate and display:
- Words per minute (WPM), using the standard definition: (correct
  characters typed / 5) / (time in minutes).
- Accuracy, as the percentage of typed characters that were correct out of
  all characters typed, including mistakes.
Show both numbers clearly on a results screen, along with a "Try again"
button that starts a new test with a fresh set of random words.
```

**Prompt 4 — a restart / new test control**

```
Add a way to restart the test at any time before it finishes, not just from
the results screen — for example a visible "Restart" button near the
typing area. Restarting picks a new random set of words and resets the
timer.
```

## What to do outside v0

Nothing for this guide — everything so far lives in the browser, with no
account and no data storage. This is intentional: get the core mechanic
feeling right before adding accounts, a database, or payments.

## How to check it worked

- [ ] Loading the home page shows a fresh block of random common words
      every time.
- [ ] Typing highlights each character correct (green) or wrong (red) as
      you go.
- [ ] The timer doesn't start until you type your first character.
- [ ] When the timer hits zero, typing stops and you see WPM and accuracy.
- [ ] Your WPM roughly matches what you'd expect — type slowly and
      carefully and confirm the number is low and accuracy is near 100%;
      type fast and sloppily and confirm accuracy drops.
- [ ] "Try again" / "Restart" gives you a new set of words and a reset
      timer.

## Common problems and fixes

**The timer starts as soon as the page loads, not on the first keystroke.**
Tell v0 directly: "The timer should not start until the user types their
first character — right now it starts on page load, fix that." v0 responds
well to being told exactly what's wrong versus what's expected.

**WPM looks way too high or too low.**
This is almost always the character-to-word conversion. The standard
formula treats every 5 characters (including spaces) as "one word" — ask
v0 to double check it's using `correctCharacters / 5 / minutesElapsed`, not
counting whitespace-separated words directly (that overcounts short words
and undercounts long ones).

**Accuracy shows over 100% or negative numbers.**
Tell v0 the accuracy calculation is producing impossible values and ask it
to show you the calculation it's using — this usually reveals it's counting
backspaced/corrected characters incorrectly. Ask it to count every
character the user typed, including ones they later corrected, as part of
the total.

**The highlighting doesn't handle backspace correctly.**
Ask v0 to make sure that deleting a character removes its correct/incorrect
highlight too, not just the character itself.
