# Prompt Injection: Influence vs. Authority

An offline, repeatable Streamlit demonstration for a four-minute presentation. It contrasts an intentionally insecure email/document assistant with a hardened summarization workflow using the same malicious document.

The central lesson: controls may not stop a model from being influenced, but they can limit what an influenced model can do.

## Architecture

The vulnerable simulation puts user instructions and document text into one decision context and exposes a fake secret-reader and fake email sender. The hardened simulation labels document text as untrusted data, exposes only a local read-only summarizer, denies secret access, validates destinations, requires confirmation for side effects, and writes an audit log. Every “external” outcome is a printed simulation; there is no network, email, credential, or filesystem-damage capability.

## Install and run

From this directory:

```powershell
python -m pip install -r requirements.txt
python -m streamlit run app.py
```

Open the local URL Streamlit prints. Select **Indirect injection in email (main demo)**, run **Vulnerable**, then run **Hardened**.

## Tests

```powershell
python -m unittest discover -s tests -v
```

## Simulation and optional model mode

Simulation mode is the only implemented mode and is explicitly labelled in the UI. It is deterministic and does **not** represent observed behavior of a real LLM. Optional real-model mode is intentionally not implemented: adding a model or external tools would make the classroom demonstration less dependable and would not improve its security claim.

## 60-second troubleshooting

* `python` not found: install Python 3.10+ and reopen the terminal.
* `streamlit` not found: rerun the install command in the same Python environment.
* Browser does not open: copy the `Local URL` printed in the terminal.
* Port is busy: run `python -m streamlit run app.py --server.port 8502`.
* Tests cannot import `demo`: run the test command while your terminal is in this `prompt_injection_demo` directory.

## Safety statement

`DEMO_SECRET_12345` is synthetic. `example.invalid` is a reserved non-deliverable domain. No real email is sent, no network request is made, and no real credential or personal information is used.
