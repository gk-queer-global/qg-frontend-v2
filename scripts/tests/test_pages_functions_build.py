"""Unit tests for scripts.pages_functions_build (no Wrangler required)."""
import os
import sys
import unittest
from unittest import mock

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, ".."))

import pages_functions_build as pfb  # noqa: E402


class PagesFunctionsBuildModuleTest(unittest.TestCase):
    def test_worker_bundle_path_under_repo_root(self):
        root = "/repo/qg-frontend-v2"
        self.assertEqual(
            pfb.worker_bundle_path(root),
            os.path.join(root, "_worker.bundle"),
        )

    def test_middleware_source_path(self):
        root = "/repo/qg-frontend-v2"
        self.assertEqual(
            pfb.middleware_source_path(root),
            os.path.join(root, "functions", "_middleware.js"),
        )

    def test_wrangler_argv_matches_deploy_pin(self):
        self.assertEqual(
            pfb.wrangler_pages_functions_build_argv("functions"),
            [
                "npx",
                "--yes",
                f"wrangler@{pfb.WRANGLER_DEPLOY_VERSION}",
                "pages",
                "functions",
                "build",
                "functions",
            ],
        )

    def test_wrangler_argv_outfile_flag(self):
        argv = pfb.wrangler_pages_functions_build_argv(
            "functions", outfile="custom.bundle"
        )
        self.assertEqual(argv[-2:], ["--outfile", "custom.bundle"])

    @mock.patch("pages_functions_build.subprocess.run")
    def test_run_pages_functions_build_returns_result(self, run_mock):
        run_mock.return_value = mock.Mock(
            returncode=0, stdout="ok", stderr=""
        )
        root = os.path.realpath(os.path.join(HERE, "..", ".."))
        result = pfb.run_pages_functions_build(root, timeout=1)
        self.assertTrue(result.succeeded)
        self.assertEqual(result.stdout, "ok")
        self.assertEqual(
            result.worker_bundle,
            pfb.worker_bundle_path(root),
        )
        run_mock.assert_called_once()
        call = run_mock.call_args
        self.assertEqual(call.kwargs["cwd"], root)
        self.assertEqual(
            call.args[0],
            pfb.wrangler_pages_functions_build_argv("functions"),
        )


if __name__ == "__main__":
    unittest.main()
