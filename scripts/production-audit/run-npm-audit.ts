import { spawnSync } from "node:child_process";

import type { NpmAuditReport } from "./types";

export interface RunNpmAuditOptions {
  cwd: string;
  npmExecutable?: string;
}

export function runNpmProductionAudit(options: RunNpmAuditOptions): NpmAuditReport {
  const npm = options.npmExecutable ?? "npm";
  const result = spawnSync(npm, ["audit", "--omit=dev", "--json"], {
    cwd: options.cwd,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });

  const stdout = result.stdout?.trim();
  if (!stdout) {
    throw new Error(
      `npm audit produced no stdout (status=${result.status}, stderr=${result.stderr?.slice(0, 500) ?? ""})`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch (error) {
    throw new Error(`npm audit stdout was not valid JSON: ${String(error)}`);
  }

  if (typeof parsed !== "object" || parsed === null || !("vulnerabilities" in parsed)) {
    throw new Error("npm audit JSON missing vulnerabilities map");
  }

  return parsed as NpmAuditReport;
}
