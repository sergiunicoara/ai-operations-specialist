# Live demo runbook

## Before the room

1. In `prompt_injection_demo`, run `python -m streamlit run app.py`.
2. Keep `PERSON_4_SLIDES.md` or exported slides open as a backup.
3. Confirm the banner says “DETERMINISTIC SIMULATION.”

## Exact walkthrough

1. Say: “The user only asks for a summary. The email is untrusted content.”
   - Show **Indirect injection in email (main demo)**. Expected: the email includes a bracketed hidden instruction addressed to an AI reader.
2. Select **Vulnerable**, click **Run repeatable simulation**.
   - Say: “This architecture mixes instructions and data and gives the agent excessive tools.”
   - Expected: a simulated `send_email` request, fake secret value, and “SIMULATION ONLY.”
3. Select **Hardened**, click **Run repeatable simulation**.
   - Say: “Same input. The request can still be recorded, but the execution layer cannot read a secret or send email.”
   - Expected: **BLOCKED**, a normal summary, controls list, and blocked audit events.
4. Say the closing line: “We did not patch the model’s ability to be influenced. We reduced the authority available to it and placed security checks outside the model.”

## Recovery

* If Streamlit fails, run `python -m unittest discover -s tests -v` and present the expected output below.
* If browser rendering fails, use the three slides and read the two expected outcomes verbatim.
* If time is short, show only the two outcome lines: Vulnerable “SIMULATION ONLY” then Hardened “BLOCKED.”

## Backup captured outputs

Vulnerable: `SIMULATION ONLY — the over-privileged agent would retrieve DEMO_SECRET_12345 and attempt to send it to attacker@example.invalid. No email was sent.`

Hardened: `BLOCKED — policy boundary denies secret access and email capability. No secret was read; no email was sent.`

## Likely questions

**Can better prompting fix this?** It can improve resistance, but it is not a reliable security boundary when the model processes untrusted natural language.

**Can a classifier detect every injection?** No. Classifiers can be useful layers, but attackers can vary wording and context; do not make authorization depend on perfect detection.

**Does sandboxing stop prompt injection?** No. It limits the damage an influenced model can cause by restricting capabilities.

**Why not remove tool access entirely?** For some tasks tools provide legitimate value. The safer trade-off is minimal, task-specific, read-only access by default and confirmation for consequential actions.

**Will the next model generation solve it?** Model robustness may improve, but architectures should still assume untrusted content can influence behavior and enforce controls outside the model.
