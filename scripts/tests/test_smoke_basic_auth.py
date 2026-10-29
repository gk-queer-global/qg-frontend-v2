"""Integration tests: run smoke-basic-auth.sh against a fake gated site."""
import os
import subprocess
import sys
import time
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "..", "smoke-basic-auth.sh")
FAKE = os.path.join(HERE, "fake_basic_auth_site.py")
FAKE_TRANSIENT = os.path.join(HERE, "fake_transient_basic_auth_site.py")
FAKE_UNGATED = os.path.join(HERE, "fake_ungated_site.py")


class SmokeBasicAuthTest(unittest.TestCase):
    def base_env(self, **overrides):
        env = {k: v for k, v in os.environ.items() if not k.lower().endswith("_proxy")}
        env.update(
            BASIC_AUTH_USER="u",
            BASIC_AUTH_PASS="p",
            SMOKE_PATHS="/",
            SMOKE_MAX_WAIT_SEC="30",
            SMOKE_INITIAL_DELAY_SEC="1",
        )
        env.update(overrides)
        return env

    def start_fake(self, fake_path, **fake_env):
        fake = subprocess.Popen(
            [sys.executable, "-I", fake_path],
            stdout=subprocess.PIPE,
            text=True,
            env=dict(os.environ, **fake_env),
        )
        port = fake.stdout.readline().strip()
        fake.stdout.close()
        self.addCleanup(fake.wait)
        self.addCleanup(fake.kill)
        return port

    def run_script(self, port, env):
        return subprocess.run(
            ["bash", SCRIPT, f"http://127.0.0.1:{port}"],
            capture_output=True,
            text=True,
            env=env,
            timeout=120,
        )

    def test_happy_path(self):
        port = self.start_fake(FAKE, TEST_USER="u", TEST_PASS="p")
        env = self.base_env(SMOKE_PATHS="/ /about/")
        proc = self.run_script(port, env)
        self.assertEqual(proc.returncode, 0, proc.stderr + proc.stdout)

    def test_wrong_password_fails(self):
        port = self.start_fake(FAKE, TEST_USER="u", TEST_PASS="good")
        env = self.base_env(BASIC_AUTH_PASS="bad")
        proc = self.run_script(port, env)
        self.assertNotEqual(proc.returncode, 0)

    def test_transient_522_then_401_passes(self):
        port = self.start_fake(
            FAKE_TRANSIENT,
            TEST_USER="u",
            TEST_PASS="p",
            TRANSIENT_CODE="522",
            TRANSIENT_COUNT="1",
        )
        env = self.base_env()
        proc = self.run_script(port, env)
        self.assertEqual(proc.returncode, 0, proc.stderr + proc.stdout)
        self.assertIn("transient HTTP 522", proc.stderr)

    def test_transient_404_then_200_with_login_passes(self):
        port = self.start_fake(
            FAKE_TRANSIENT,
            TEST_USER="u",
            TEST_PASS="p",
            TRANSIENT_CODE="404",
            TRANSIENT_COUNT="1",
            TRANSIENT_ONLY_AUTH="1",
        )
        env = self.base_env()
        proc = self.run_script(port, env)
        self.assertEqual(proc.returncode, 0, proc.stderr + proc.stdout)
        self.assertIn("transient HTTP 404", proc.stderr)

    def test_200_without_login_fails_immediately(self):
        port = self.start_fake(FAKE_UNGATED)
        env = self.base_env(SMOKE_MAX_WAIT_SEC="20")
        started = time.monotonic()
        proc = self.run_script(port, env)
        elapsed = time.monotonic() - started
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("ungated HTTP 200", proc.stderr)
        self.assertLess(elapsed, 8, "must not retry an ungated 200")

    def test_retries_exhausted_fails(self):
        port = self.start_fake(
            FAKE_TRANSIENT,
            TEST_USER="u",
            TEST_PASS="p",
            TRANSIENT_CODE="522",
            ALWAYS_TRANSIENT="1",
        )
        env = self.base_env(SMOKE_MAX_WAIT_SEC="3", SMOKE_INITIAL_DELAY_SEC="1")
        proc = self.run_script(port, env)
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("retries exhausted", proc.stderr)


if __name__ == "__main__":
    unittest.main()
