# Person 4 — Three slides

## Slide 1 — The vulnerable path

* Untrusted email text enters the same context as the user request.
* The model can interpret data as instructions.
* Excessive permissions turn confusion into simulated impact.
* Demo: fake secret read + fake email attempt — **simulation only**.

## Slide 2 — The safer path

* Treat retrieved content as untrusted data.
* Least privilege: summary workflow has no secret or email tool.
* Capability isolation / restricted sandbox.
* Validate actions and destinations; require human confirmation.
* Audit every request and block.

## Slide 3 — What this does not solve

* It does not guarantee a model ignores malicious instructions.
* It reduces available authority and contains damage.
* Prompt injection is a system-design risk, not merely a model bug.
