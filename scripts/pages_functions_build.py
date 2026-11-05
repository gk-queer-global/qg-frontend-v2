"""Build Cloudflare Pages Functions with the Wrangler version used in deploy CI.

``wrangler pages functions build`` writes a bundled worker script to the
repository root by default (``_worker.bundle``). Success should be determined
from the process exit code and that artifact, not from Wrangler log lines
(which ``WRANGLER_LOG=error`` suppresses even on successful builds).
"""

from __future__ import annotations

import os
import subprocess
from dataclasses import dataclass

# cloudflare/wrangler-action@v3 installs this release when Wrangler is not in package.json.
WRANGLER_DEPLOY_VERSION = "3.90.0"

DEFAULT_FUNCTIONS_DIR = "functions"
DEFAULT_WORKER_BUNDLE = "_worker.bundle"


def repo_root_from_scripts_dir(scripts_dir: str) -> str:
    """Return the repository root given the absolute path to ``scripts/``."""
    return os.path.normpath(os.path.join(scripts_dir, ".."))


def worker_bundle_path(root: str, filename: str = DEFAULT_WORKER_BUNDLE) -> str:
    """Absolute path to Wrangler's default ``pages functions build`` output file."""
    return os.path.join(root, filename)


def middleware_source_path(
    root: str, functions_dir: str = DEFAULT_FUNCTIONS_DIR
) -> str:
    """Absolute path to ``functions/_middleware.js`` (or equivalent)."""
    return os.path.join(root, functions_dir, "_middleware.js")


def wrangler_pages_functions_build_argv(
    functions_dir: str = DEFAULT_FUNCTIONS_DIR,
    *,
    wrangler_version: str = WRANGLER_DEPLOY_VERSION,
    outfile: str | None = None,
) -> list[str]:
    """Argv for ``npx wrangler pages functions build`` (without ``npx`` prefix)."""
    argv = [
        "npx",
        "--yes",
        f"wrangler@{wrangler_version}",
        "pages",
        "functions",
        "build",
        functions_dir,
    ]
    if outfile is not None:
        argv.extend(["--outfile", outfile])
    return argv


@dataclass(frozen=True)
class PagesFunctionsBuildResult:
    """Outcome of a local Pages Functions bundle."""

    returncode: int
    stdout: str
    stderr: str
    worker_bundle: str

    @property
    def succeeded(self) -> bool:
        return self.returncode == 0

    def worker_bundle_exists(self) -> bool:
        return os.path.isfile(self.worker_bundle)


def run_pages_functions_build(
    root: str,
    *,
    functions_dir: str = DEFAULT_FUNCTIONS_DIR,
    wrangler_version: str = WRANGLER_DEPLOY_VERSION,
    outfile: str = DEFAULT_WORKER_BUNDLE,
    timeout: float = 120,
    env: dict[str, str] | None = None,
) -> PagesFunctionsBuildResult:
    """Run Wrangler ``pages functions build`` under ``root`` and return the outcome."""
    bundle_path = worker_bundle_path(root, outfile)
    proc = subprocess.run(
        wrangler_pages_functions_build_argv(
            functions_dir,
            wrangler_version=wrangler_version,
            outfile=outfile if outfile != DEFAULT_WORKER_BUNDLE else None,
        ),
        cwd=root,
        capture_output=True,
        text=True,
        timeout=timeout,
        env=env,
    )
    return PagesFunctionsBuildResult(
        returncode=proc.returncode,
        stdout=proc.stdout,
        stderr=proc.stderr,
        worker_bundle=bundle_path,
    )
