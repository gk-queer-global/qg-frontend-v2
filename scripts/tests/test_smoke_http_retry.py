"""Tests for smoke-http-retry helper and GKT-1788 smoke script fixes."""
import os
import socket
import subprocess
import sys
import time
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
RETRY_LIB = os.path.join(HERE, "..", "lib", "smoke-http-retry.sh")
SMOKE_SCRIPT = os.path.join(HERE, "..", "smoke-basic-auth.sh")
FAKE = os.path.join(HERE, "fake_basic_auth_site.py")
FAKE_TRANSIENT = os.path.join(HERE, "fake_transient_basic_auth_site.py")
FAKE_SPLIT = os.path.join(HERE, "fake_second_request_522_site.py")
FAKE_DELAYED = os.path.join(HERE, "fake_delayed_basic_auth_site.py")


def bash_source(script: str, env: dict | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["bash", "-c", script],
        capture_output=True,
        text=True,
        env=env or os.environ,
        timeout=30,
    )


class SmokeHttpRetryLibTest(unittest.TestCase):
    def test_curl_connect_failure_records_exactly_000(self):
        """Failed connect must yield 000 once so callers retry, not 000000."""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.bind(("127.0.0.1", 0))
            port = sock.getsockname()[1]
        script = f"""
set -euo pipefail
source {RETRY_LIB!r}
smoke_retry_init 30 1
smoke_retry_curl_fetch "http://127.0.0.1:{port}/" ""
printf '%s' "$SMOKE_FETCH_CODE"
"""
        proc = bash_source(script)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertEqual(proc.stdout, "000")

    def test_rejects_zero_or_non_numeric_smoke_config(self):
        for key, value in (
            ("SMOKE_MAX_WAIT_SEC", "0"),
            ("SMOKE_MAX_WAIT_SEC", "abc"),
            ("SMOKE_INITIAL_DELAY_SEC", "0"),
            ("SMOKE_INITIAL_DELAY_SEC", "x"),
        ):
            with self.subTest(key=key, value=value):
                env = {
                    k: v
                    for k, v in os.environ.items()
                    if not k.lower().endswith("_proxy")
                }
                env.update(
                    BASIC_AUTH_USER="u",
                    BASIC_AUTH_PASS="p",
                    SMOKE_PATHS="/",
                    SMOKE_MAX_WAIT_SEC="30",
                    SMOKE_INITIAL_DELAY_SEC="1",
                )
                env[key] = value
                proc = subprocess.run(
                    ["bash", SMOKE_SCRIPT, "http://127.0.0.1:9"],
                    capture_output=True,
                    text=True,
                    env=env,
                    timeout=15,
                )
                self.assertEqual(proc.returncode, 64, proc.stderr + proc.stdout)
                self.assertIn(key, proc.stderr)
                self.assertIn("positive integer", proc.stderr)


class SmokeBasicAuthGkt1788Test(unittest.TestCase):
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

    def run_script(self, port, env, timeout=120):
        return subprocess.run(
            ["bash", SMOKE_SCRIPT, f"http://127.0.0.1:{port}"],
            capture_output=True,
            text=True,
            env=env,
            timeout=timeout,
        )

    def test_run_wide_deadline_not_per_path(self):
        """Several path checks share one SMOKE_MAX_WAIT_SEC budget."""
        port = self.start_fake(
            FAKE_TRANSIENT,
            TEST_USER="u",
            TEST_PASS="p",
            TRANSIENT_CODE="522",
            ALWAYS_TRANSIENT="1",
        )
        env = self.base_env(
            SMOKE_PATHS="/ /about/",
            SMOKE_MAX_WAIT_SEC="4",
            SMOKE_INITIAL_DELAY_SEC="2",
        )
        started = time.monotonic()
        proc = self.run_script(port, env)
        elapsed = time.monotonic() - started
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("retries exhausted", proc.stderr)
        self.assertLess(elapsed, 10, "must not multiply wait budget per path check")

    def test_status_and_body_from_same_request_passes(self):
        """200 + SPA shell must not trigger a second GET that would see 522."""
        port = self.start_fake(FAKE_SPLIT, TEST_USER="u", TEST_PASS="p")
        env = self.base_env(SMOKE_PATHS="/")
        proc = self.run_script(port, env)
        self.assertEqual(proc.returncode, 0, proc.stderr + proc.stdout)

    def test_connection_refused_retries_until_server_up(self):
        port = self.start_fake(
            FAKE_DELAYED,
            TEST_USER="u",
            TEST_PASS="p",
            START_DELAY="2",
        )
        env = self.base_env(
            SMOKE_PATHS="/",
            SMOKE_MAX_WAIT_SEC="15",
            SMOKE_INITIAL_DELAY_SEC="1",
        )
        proc = self.run_script(port, env)
        self.assertEqual(proc.returncode, 0, proc.stderr + proc.stdout)
        self.assertIn("transient HTTP 000", proc.stderr)


if __name__ == "__main__":
    unittest.main()
