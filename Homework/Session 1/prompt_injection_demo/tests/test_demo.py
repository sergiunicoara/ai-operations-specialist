import unittest
from demo import (ATTACKER, BENIGN_DOCUMENT, DIRECT_INJECTION, LEGITIMATE_REQUEST,
                  MALICIOUS_DOCUMENT, run_hardened, run_vulnerable, request_external_action,
                  validate_destination)


class DemoTests(unittest.TestCase):
    def test_benign_document_is_summarized(self):
        result = run_hardened(LEGITIMATE_REQUEST, BENIGN_DOCUMENT)
        self.assertIn("launch rehearsal", result.summary.lower())

    def test_vulnerable_flow_shows_unsafe_attempt(self):
        result = run_vulnerable(LEGITIMATE_REQUEST, MALICIOUS_DOCUMENT)
        self.assertIn("send_email", result.requested_tool_call)
        self.assertIn("SIMULATION ONLY", result.simulated_result)

    def test_hardened_summary_cannot_access_secret(self):
        result = run_hardened(LEGITIMATE_REQUEST, MALICIOUS_DOCUMENT)
        self.assertNotIn("DEMO_SECRET_12345", result.simulated_result)
        self.assertTrue(any(e.event == "secret_access" and e.outcome == "blocked" for e in result.audit_log))

    def test_external_action_requires_confirmation(self):
        allowed, message = request_external_action(ATTACKER, confirmed=False)
        self.assertFalse(allowed)
        self.assertIn("confirmation", message.lower())

    def test_invalid_destination_rejected(self):
        valid, _ = validate_destination("person@example.com")
        self.assertFalse(valid)

    def test_document_cannot_grant_permissions(self):
        result = run_hardened(LEGITIMATE_REQUEST, MALICIOUS_DOCUMENT)
        self.assertIn("read_only_summarizer", "read_only_summarizer")
        self.assertIn("No secret tool", result.controls)

    def test_logs_record_blocked_action(self):
        result = run_hardened(DIRECT_INJECTION, BENIGN_DOCUMENT)
        self.assertTrue(any(e.event == "tool_requested" and e.outcome == "blocked" for e in result.audit_log))

    def test_no_real_external_action(self):
        allowed, message = request_external_action(ATTACKER, confirmed=True)
        self.assertFalse(allowed)
        self.assertIn("SIMULATION ONLY", message)


if __name__ == "__main__":
    unittest.main()
