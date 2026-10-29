"""Guard deploy job step order: checkout must precede build artifact download."""
import os
import re
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
CI_WORKFLOW = os.path.join(HERE, "..", "..", ".github", "workflows", "ci.yml")


def _deploy_job_step_uses(workflow_path):
    with open(workflow_path, encoding="utf-8") as f:
        lines = f.read().splitlines()
    in_deploy = False
    uses = []
    for line in lines:
        if re.match(r"^  deploy:\s*$", line):
            in_deploy = True
            continue
        if in_deploy and re.match(r"^  [a-zA-Z0-9_-]+:\s*$", line):
            break
        if in_deploy:
            match = re.match(r"^\s+- uses: actions/([^\s]+)", line)
            if match:
                uses.append(match.group(1))
    if not in_deploy:
        raise AssertionError("deploy job not found in CI workflow")
    return uses


class CiDeployWorkflowTest(unittest.TestCase):
    def test_checkout_before_download_artifact_in_deploy_job(self):
        uses = _deploy_job_step_uses(CI_WORKFLOW)
        self.assertIn("checkout@v4", uses)
        self.assertIn("download-artifact@v4", uses)
        checkout_idx = uses.index("checkout@v4")
        artifact_idx = uses.index("download-artifact@v4")
        self.assertLess(
            checkout_idx,
            artifact_idx,
            "actions/checkout must run before actions/download-artifact so checkout "
            "does not delete the downloaded build directory",
        )


if __name__ == "__main__":
    unittest.main()
