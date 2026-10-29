"""Integration tests: stage-pages-deploy.sh copies build output and functions."""
import os
import shutil
import subprocess
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "..", "stage-pages-deploy.sh")
ROOT = os.path.join(HERE, "..", "..")


class StagePagesDeployTest(unittest.TestCase):
    def test_stages_build_and_functions(self):
        build = tempfile.mkdtemp()
        dest = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, build, ignore_errors=True)
        self.addCleanup(shutil.rmtree, dest, ignore_errors=True)
        with open(os.path.join(build, "index.html"), "w", encoding="utf-8") as f:
            f.write('<div id="root"></div>')
        proc = subprocess.run(
            ["bash", SCRIPT, build, dest],
            capture_output=True,
            text=True,
            timeout=30,
        )
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertTrue(os.path.isfile(os.path.join(dest, "index.html")))
        self.assertTrue(os.path.isfile(os.path.join(dest, "functions", "_middleware.js")))
        with open(os.path.join(dest, "functions", "_middleware.js"), encoding="utf-8") as f:
            self.assertIn("onRequest", f.read())
        with open(os.path.join(ROOT, "functions", "_middleware.js"), encoding="utf-8") as f:
            expected = f.read()
        with open(os.path.join(dest, "functions", "_middleware.js"), encoding="utf-8") as f:
            self.assertEqual(f.read(), expected)


if __name__ == "__main__":
    unittest.main()
