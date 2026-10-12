# Lessons

- **Write and confirm the plan before building** (project CLAUDE.md: plan in `tasks/todo.md`, check in before implementing). I started implementing straight from the request; the user had to ask "don't we need a plan?". Next time: write the plan first, ask for the go-ahead, then build.
- Do not treat automatic background-task notifications as user approval.
- Never let an agent interact with a bot check or CAPTCHA, even when the prompt says not to: enforce it in code (stop before the decided action runs) and test the detector.
- Do not record the whole desktop for a deliverable: it can capture unrelated private windows. Check frames before keeping a recording.
- Verify tool output before trusting it (a 36-byte or 0-byte "recording", a 93 KB file for 150 s) and measure with the same mode (headed vs headless) when comparing.
