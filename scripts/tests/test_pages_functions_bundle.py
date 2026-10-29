"""Ensure Pages Functions bundle with the Wrangler version used in deploy CI."""
import os
import subprocess
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..", "..")
FUNCTIONS_DIR = os.path.join(ROOT, "functions")

# cloudflare/wrangler-action@v3 installs this release when Wrangler is not in package.json.
WRANGLER_DEPLOY_VERSION = "3.90.0"


class PagesFunctionsBundleTest(unittest.TestCase):
    def test_middleware_bundles_with_deploy_wrangler(self):
        self.assertTrue(
            os.path.isfile(os.path.join(FUNCTIONS_DIR, "_middleware.js")),
            "expected functions/_middleware.js",
        )
        proc = subprocess.run(
            [
                "npx",
                "--yes",
                f"wrangler@{WRANGLER_DEPLOY_VERSION}",
                "pages",
                "functions",
                "build",
                "functions",
            ],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=120,
        )
        self.assertEqual(
            proc.returncode,
            0,
            f"wrangler pages functions build failed:\n{proc.stdout}\n{proc.stderr}",
        )
        combined = f"{proc.stdout}\n{proc.stderr}"
        self.assertIn("Compiled Worker successfully", combined)


if __name__ == "__main__":
    unittest.main()
