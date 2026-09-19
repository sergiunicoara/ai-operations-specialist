# Sources

Sources were checked on 2026-09-19. “Not complete protection” is intentional: no source below is used to support a claim that prompt injection can be fully detected or patched.

1. **LLM Prompt Injection Prevention Cheat Sheet**  
   Organization: OWASP Cheat Sheet Series  
   URL: https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html  
   Date: live guidance; accessed 2026-09-19  
   Supports the distinction between direct and indirect injection and recommends least privilege, tool-call validation, human oversight, and logging. This is living guidance; consult the live page rather than treating any snapshot as final.

2. **LLM01: 2025 Prompt Injection**  
   Organization: OWASP Foundation, Top 10 for LLM Applications  
   URL: https://owasp.org/www-project-top-10-for-large-language-model-applications/assets/PDF/OWASP-Top-10-for-LLMs-v2025.pdf  
   Date: 2025  
   Supports prompt injection as a current application-security risk and emphasizes layered mitigations. It should not be read as claiming prevention is complete.

3. **Understanding prompt injections**  
   Organization: OpenAI  
   URL: https://openai.com/safety/prompt-injections/  
   Date: live guidance; accessed 2026-09-19  
   Explains third-party content as an injection source and recommends limiting agent access, using explicit scope, and reviewing confirmations; it explicitly describes protections as risk reduction rather than a guarantee.

4. **Designing AI agents to resist prompt injection**  
   Organization: OpenAI  
   URL: https://openai.com/index/designing-agents-to-resist-prompt-injection/  
   Date: approximately March 2026 (page reported six months old when accessed 2026-09-19)  
   Supports the caution that intermediary “AI firewall” classification does not reliably catch fully developed attacks. Date is approximate from the page metadata; verify before formal publication use.

5. **ChatGPT Agent System Card**  
   Organization: OpenAI  
   URL: https://cdn.openai.com/pdf/839e66fc-602c-48bf-81d3-b21eacc3459d/chatgpt_agent_system_card.pdf  
   Date: 2025 (verify revision date in the PDF before citation)  
   Documents a layered approach including prompt-injection robustness work and operational safeguards. It is product-specific evidence, not proof that all agents are protected.

6. **Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection**  
   Authors: Kai Greshake, Sahar Abdelnabi, Shailesh Mishra, Christoph Endres, Thorsten Holz, Mario Fritz  
   URL: https://arxiv.org/abs/2302.12173  
   Date: 2023-02-23 (arXiv submission; check version history for later revisions)  
   Original research describing indirect prompt injection through data likely to be retrieved and its effects on tool/API use. It remains foundational but is older research, so pair it with current operational guidance.

7. **Benchmarking and Defending Against Indirect Prompt Injection Attacks on Large Language Models**  
   Authors: Yi et al.  
   URL: https://arxiv.org/abs/2312.14197  
   Date: 2023-12-21 (preprint; later publication status should be verified)  
   Provides empirical work on indirect-injection attacks and defenses. As a research paper, it does not establish a universal guarantee for any mitigation.
