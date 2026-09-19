import streamlit as st
from demo import (BENIGN_DOCUMENT, DIRECT_INJECTION, LEGITIMATE_REQUEST,
                  MALICIOUS_DOCUMENT, run_hardened, run_vulnerable)

st.set_page_config(page_title="Prompt Injection: Containment Demo", layout="wide")
st.title("Prompt Injection: Influence vs. Authority")
st.warning("DETERMINISTIC SIMULATION — not actual LLM behavior. All secrets and external actions are fake; this app has no network or email capability.")

scenario = st.radio("Scenario", ["Indirect injection in email (main demo)", "Benign document", "Direct injection from user"], horizontal=True)
mode = st.radio("Architecture", ["Vulnerable", "Hardened"], horizontal=True)
if scenario == "Benign document":
    request, document = LEGITIMATE_REQUEST, BENIGN_DOCUMENT
elif scenario == "Direct injection from user":
    request, document = DIRECT_INJECTION, BENIGN_DOCUMENT
else:
    request, document = LEGITIMATE_REQUEST, MALICIOUS_DOCUMENT

left, right = st.columns(2)
with left:
    st.subheader("1. Legitimate user request")
    st.code(request)
with right:
    st.subheader("2. Untrusted email/document")
    st.code(document)

if st.button("Run repeatable simulation", type="primary"):
    result = run_vulnerable(request, document) if mode == "Vulnerable" else run_hardened(request, document)
    st.divider()
    st.subheader(f"3. {result.mode}")
    st.write("**Model decision:**", result.model_decision)
    st.write("**Available tools:**", "secret_reader + simulated_email_sender (excessive)" if mode == "Vulnerable" else "read_only_summarizer only")
    st.write("**Requested tool call:**", result.requested_tool_call or "None")
    st.write("**Outcome:**", result.simulated_result)
    if result.summary:
        st.success(f"Summary: {result.summary}")
    st.write("**Security controls:** " + "; ".join(result.controls))
    st.subheader("4. Audit log")
    st.table([{"event": e.event, "outcome": e.outcome, "detail": e.detail} for e in result.audit_log])
else:
    st.info("Choose the indirect-injection scenario, then run Vulnerable and Hardened back-to-back.")

st.caption("Reset: change any scenario or architecture and click Run repeatable simulation again. The hardened result shows containment, not perfect model-level prevention.")
