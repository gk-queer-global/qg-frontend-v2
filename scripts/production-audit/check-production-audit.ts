import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildCheckResult, compareAllowlist } from "./compare-allowlist";
import { extractProductionFindings } from "./extract-findings";
import { logError, logInfo } from "./json-logger";
import { loadAllowlistFile } from "./load-allowlist";
import { runNpmProductionAudit } from "./run-npm-audit";
import type { NpmAuditReport } from "./types";

export interface RunCheckOptions {
  repoRoot: string;
  allowlistPath?: string;
  auditReportPath?: string;
}

function defaultAllowlistPath(): string {
  return resolve(__dirname, "../production-audit-allowlist.json");
}

function loadAuditReport(path: string): NpmAuditReport {
  const raw = readFileSync(resolve(path), "utf8");
  return JSON.parse(raw) as NpmAuditReport;
}

export function runProductionAuditCheck(options: RunCheckOptions): number {
  const repoRoot = resolve(options.repoRoot);
  const allowlistPath = options.allowlistPath ?? defaultAllowlistPath();

  try {
    const allowlist = loadAllowlistFile(allowlistPath);
    const auditReport = options.auditReportPath
      ? loadAuditReport(options.auditReportPath)
      : runNpmProductionAudit({ cwd: repoRoot });

    const findings = extractProductionFindings(auditReport);
    const comparison = compareAllowlist(findings, allowlist);
    const result = buildCheckResult(comparison);

    logInfo("production_audit_check_complete", {
      ok: result.ok,
      summary: result.summary,
      allowlistedFindings: result.comparison.allowlistedFindings,
      unallowlistedFindings: result.comparison.unallowlistedFindings,
      staleAllowlistEntries: result.comparison.staleAllowlistEntries,
    });

    if (!result.ok) {
      if (result.comparison.unallowlistedFindings.length > 0) {
        logError("unallowlisted_production_advisories", {
          findings: result.comparison.unallowlistedFindings,
        });
      }
      if (result.comparison.staleAllowlistEntries.length > 0) {
        logError("stale_allowlist_entries", {
          entries: result.comparison.staleAllowlistEntries,
        });
      }
      return 1;
    }

    return 0;
  } catch (error) {
    logError("production_audit_check_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return 1;
  }
}

if (require.main === module) {
  const repoRoot = process.argv[2] ? resolve(process.argv[2]) : resolve(__dirname, "../..");
  const allowlistFlagIndex = process.argv.indexOf("--allowlist");
  const auditFlagIndex = process.argv.indexOf("--audit-report");

  const allowlistPath =
    allowlistFlagIndex >= 0 ? resolve(process.argv[allowlistFlagIndex + 1]) : undefined;
  const auditReportPath =
    auditFlagIndex >= 0 ? resolve(process.argv[auditFlagIndex + 1]) : undefined;

  const exitCode = runProductionAuditCheck({
    repoRoot,
    allowlistPath,
    auditReportPath,
  });
  process.exit(exitCode);
}
