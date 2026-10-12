# Speaker notes (about 4 minutes, ~560 words)

Matched to the screens and actions in [DEMO_RUNBOOK.md](DEMO_RUNBOOK.md). Numbers come from `COMPARISON.md`; if your live run differs, say the numbers you see. Words in **[brackets]** are actions, not speech.

## 0:00-0:30 · The task (terminal open, `tasks/live.json` visible)

"How does an agent use a browser the way a person does? Here is a job a person would do: find the same microphone in three online shops and compare the price including shipping. I will give a browser agent that job, watch it work, then check its work, and compare it with a program that does no AI at all.

Rules I set: read-only. No login, no cart, no checkout, only these three shops, a step limit and a time limit, and it must not get past any bot check. **[Run `python run.py live`.]**"

## 0:30-1:30 · The agent working (browser window on the right)

"A fresh Chrome window opened: no saved logins, no cookies, no extensions. **[Do not touch it.]** It looks at the page as a screenshot plus a list of buttons and links, decides what to do, does it, and looks again. It is not guessing from memory: it reads the live page.

Each step is one call to the model, about a second or two of thinking plus the page load. Watch for what it reads: the title, the price, and whatever the page says about shipping. When it has all three shops it stops. It will not open a cart, because I told it not to, and a guard in the code would stop it if it tried."

**[If a shop blocks it:]** "That is a bot check. The agent is stopped without touching it and the shop is recorded as blocked. We do not get around that, and that is a legitimate result."

## 1:30-2:45 · Walking through the step log (open `report.html`)

"This report is the agent's diary. At the top: about a minute, five steps, five model calls, roughly sixty-eight thousand tokens, around eight cents. **[Point at the cards.]**

Each step has four parts. **[Show slide 1 or scroll to one step.]** One, observe: the screenshot it saw. Two, decide: its goal and reasoning. Three, act: the click, scroll or navigate. Four, verify: at the next step it says whether that worked.

Now the part that matters: mistakes. **[Pick what is really in the report: a flagged step, or the verification table.]** In our practice runs on the books site, the agent got the price of one book right, but reported a web address for it that it never visited: it wrote ...973 where the real page is ...966. The agent said done. It was only an independent check, a plain fetch of that page, that returned not found. If your run shows no mistakes, say so; the report says it too, and the verification table still shows every price was checked."

## 2:45-3:30 · Comparison (slide 2 or `COMPARISON.md`)

"Same task, no AI: fixed code that reads each shop's structured data. **[Point at the table.]** On the books task: the agent took about 73 seconds and 14 cents; the program took under 5 seconds and nothing. On the live shops: 54 seconds and 7 cents against under 2 seconds. Both gave the same answers every time.

Honest limits. The program needs separate code for every site, breaks when a page layout changes, and cannot see shipping unless it is in the page's source. The agent needs no per-site code and sees what a person sees, but it is slower, costs money, and can say things that are not true, like that web address. One shop showed a human-verification page, so both approaches lost it. That was only three runs with one model on one day."

## 3:30-4:00 · Conclusion (slide 3)

"So when do you use which? If there is an API or structured data, and you read the same sites again and again, use that: it is fast, cheap and repeatable. If there is no API, the sites vary, or the answer only appears after you click around, use a browser agent, with limits, read-only, and a check on its output. Best of both: let the agent explore once, then turn what it learned into code. And never trust an agent's own 'done'. Check the numbers. Thank you."

## Timing check

| Segment | Target | Words |
|---|---|---|
| Task | 0:30 | ~85 |
| Agent working | 1:00 | ~125 |
| Step log | 1:15 | ~190 |
| Comparison | 0:45 | ~135 |
| Conclusion | 0:30 | ~95 |

If the live run is slow, narrate longer over it (section 2) and trim the comparison to the two headline numbers.
