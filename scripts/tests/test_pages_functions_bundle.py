"""Ensure Pages Functions bundle with the Wrangler version used in deploy CI."""
import os
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, ".."))
ROOT = os.path.join(HERE, "..", "..")

import pages_functions_build as pfb  # noqa: E402


class PagesFunctionsBundleTest(unittest.TestCase):
    def test_middleware_bundles_with_deploy_wrangler(self):
        self.assertTrue(
            os.path.isfile(pfb.middleware_source_path(ROOT)),
            "expected functions/_middleware.js",
        )
        result = pfb.run_pages_functions_build(ROOT)
        self.assertTrue(
            result.succeeded,
            "wrangler pages functions build failed:\n"
            f"{result.stdout}\n{result.stderr}",
        )
        self.assertTrue(
            result.worker_bundle_exists(),
            f"expected bundled worker at {result.worker_bundle}",
        )


if __name__ == "__main__":
    unittest.main()
