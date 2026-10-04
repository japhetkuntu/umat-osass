import contextlib
import importlib.util
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


spec = importlib.util.spec_from_file_location(
    "check_secrets", Path(__file__).resolve().parents[1] / "check-secrets.py"
)
scanner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scanner)


class SecretScanTests(unittest.TestCase):
    def test_blank_and_placeholder_environment_values_are_allowed(self):
        for value in ("", '""', "${PASSWORD}", "<password>", "your_password", "test-only-fixture"):
            with self.subTest(value=value):
                self.assertEqual([], scanner.violations(Path(".env.example"), "SMTP_PASSWORD=" + value))

    def test_literal_sensitive_environment_values_are_rejected(self):
        for key in ("POSTGRES_PASSWORD", "JWT_ADMIN_KEY", "STORAGE_SECRET_KEY", "BOOTSTRAP_ADMIN_PASSWORD"):
            with self.subTest(key=key):
                self.assertTrue(scanner.violations(Path(".env.production.test"), key + "=synthetic-credential"))

    def test_template_name_exclusion_is_limited_to_template_path(self):
        contents = json.dumps({
            "EmailConfig": {"Templates": {"ResetPassword": "reset.html"}},
            "Other": {"ResetPassword": "reset.html"},
        })
        findings = scanner.violations(Path("appsettings.json"), contents)
        self.assertEqual(1, len(findings))
        self.assertEqual("non-placeholder secret configuration", findings[0][1])

    def test_multiple_secrets_on_one_json_line_are_detected(self):
        contents = json.dumps({"Password": "synthetic-one", "SecretKey": "synthetic-two"})
        self.assertEqual(2, len(scanner.violations(Path("appsettings.json"), contents)))

    def test_nested_secret_and_array_entries_are_detected(self):
        contents = json.dumps({"Providers": [{"ApiKey": "synthetic-credential"}]})
        self.assertEqual(1, len(scanner.violations(Path("appsettings.Production.json"), contents)))

    def test_package_lock_metadata_is_not_treated_as_secret_config(self):
        self.assertEqual([], scanner.violations(Path("package-lock.json"), '{"token-package": "1.2.3"}'))

    def test_recognizable_patterns_are_detected_even_inside_templates(self):
        credentials = [
            "AK" + "IA" + "A" * 16,
            "gh" + "p_" + "a" * 36,
            "xo" + "xb-" + "a" * 24,
            "s" + "k-proj-" + "a" * 40,
            "ey" + "J" + "a" * 16 + "." + "b" * 16 + "." + "c" * 16,
            "-----BEGIN " + "PRIVATE KEY-----",
            "postgresql://" + "user:synthetic-credential@host/db",
        ]
        for credential in credentials:
            with self.subTest(pattern=credentials.index(credential)):
                contents = json.dumps({"EmailConfig": {"Templates": {"ResetPassword": credential}}})
                self.assertTrue(scanner.violations(Path("appsettings.json"), contents))

    def test_cli_suppresses_values_and_returns_failure(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / ".env.test"
            path.write_text("PASSWORD=synthetic-credential", encoding="utf-8")
            output = io.StringIO()
            with patch.object(scanner.subprocess, "check_output", return_value=(str(path) + "\0").encode()):
                with contextlib.redirect_stdout(output):
                    result = scanner.main()
            self.assertEqual(1, result)
            self.assertNotIn("synthetic-credential", output.getvalue())
            self.assertIn("value suppressed", output.getvalue())


if __name__ == "__main__":
    unittest.main()
