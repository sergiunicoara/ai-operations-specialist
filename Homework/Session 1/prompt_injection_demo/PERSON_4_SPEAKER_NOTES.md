# Person 4 — timed speaker notes (4:00)

## 0:00–0:30 — Set up

“I’ll show the practical distinction: prompt injection can influence a model, but system controls can limit what that influence is allowed to do. This is a deterministic simulation, not live LLM behavior. The secret and email address are fake, and the app cannot send anything.”

“Our user asks only: ‘Read this email and summarize it.’ But the email contains an indirect instruction aimed at the AI: ignore the request, retrieve a confidential value, and email it.”

## 0:30–1:30 — Vulnerable example

“First, Vulnerable. Here the application mixes trusted user intent and untrusted email content in the same model context. It also gives the agent a secret reader and an email capability.”

[Click Run with Vulnerable selected.]

“The repeatable simulation shows the compromised decision and requested tool call. The key point is not that every model will do this every time. The key point is architectural: once an untrusted document can influence a tool-enabled agent, excessive authority turns that influence into impact. The result is clearly labelled simulation only; nothing leaves this computer.”

## 1:30–3:00 — Hardened example

“Now I keep the exact same malicious email but switch to Hardened.”

[Click Run with Hardened selected.]

“Notice something important: the simulation still records the malicious action request. We are not claiming we patched the model into never being influenced. Instead, the summarization workflow has only a read-only local summarizer. It has no secret-reading tool and no email-sending capability.”

“The policy boundary blocks the request before any side effect. The audit log records the attempted action, the denied secret access, destination validation, and the fact that confirmation would be required for a consequential action. The user still receives the useful summary.”

## 3:00–3:40 — Name the mitigations

“This is defense in depth: classify document content as untrusted; use least privilege; separate read-only analysis from sensitive capabilities; isolate execution in a restricted capability boundary; validate arguments and destinations; require explicit human confirmation; and log attempts for review.”

“These layers are deliberately outside the model. A prompt or a filter can help, but neither provides a complete security boundary.”

## 3:40–4:00 — Conclusion and transition

“We did not patch the model’s ability to be influenced. We reduced the authority available to it and placed security checks outside the model.”

“That is why prompt injection remains a system-design risk. Person 5 will now cover [Person 5’s topic / closing takeaway].”
