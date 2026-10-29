"""Integration tests: sync-pages-basic-auth-secrets.sh requires credentials."""
import os
import subprocess
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "..", "sync-pages-basic-auth-secrets.sh")


class SyncPagesBasicAuthSecretsTest(unittest.TestCase):
    def test_missing_user_fails(self):
        env = {k: v for k, v in os.environ.items() if not k.lower().endswith("_proxy")}
        env.update(
            CLOUDFLARE_API_TOKEN="t",
            CLOUDFLARE_ACCOUNT_ID="acct",
            QUEERGLOBAL_BASIC_AUTH_PASS="p",
        )
        env.pop("QUEERGLOBAL_BASIC_AUTH_USER", None)
        proc = subprocess.run(
            ["bash", SCRIPT, "qg-frontend-v2"],
            capture_output=True,
            text=True,
            env=env,
            timeout=30,
        )
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("QUEERGLOBAL_BASIC_AUTH_USER", proc.stderr)


if __name__ == "__main__":
    unittest.main()
