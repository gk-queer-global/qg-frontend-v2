import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import { compareAllowlist, buildCheckResult } from "./compare-allowlist";
import { extractProductionFindings } from "./extract-findings";
import { runProductionAuditCheck } from "./check-production-audit";
import type { AllowlistFile, NpmAuditReport } from "./types";

const SCRIPT_ROOT = resolve(__dirname, "..");
const FIXTURES_DIR = resolve(SCRIPT_ROOT, "fixtures");
const ALLOWLIST_PATH = resolve(SCRIPT_ROOT, "production-audit-allowlist.json");

function loadFixture(name: string): NpmAuditReport {
  const raw = readFileSync(resolve(FIXTURES_DIR, name), "utf8");
  return JSON.parse(raw) as NpmAuditReport;
}

test("extractProductionFindings resolves transitive high advisories", () => {
  const report = loadFixture("minimal-audit-report.json");
  const findings = extractProductionFindings(report);
  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.id, "GHSA-aaaa-bbbb-cccc-dddd");
});

test("compareAllowlist flags unallowlisted and stale entries", () => {
  const findings = extractProductionFindings(loadFixture("minimal-audit-report.json"));
  const allowlist: AllowlistFile = {
    version: 1,
    entries: [
      {
        id: "GHSA-stale-entry-1111",
        package: "removed-pkg",
        severity: "high",
        note: "Tracked by the dependency fix series (G1).",
      },
    ],
  };

  const comparison = compareAllowlist(findings, allowlist);
  assert.equal(comparison.unallowlistedFindings.length, 1);
  assert.equal(comparison.staleAllowlistEntries.length, 1);
  assert.equal(buildCheckResult(comparison).ok, false);
});

test("runProductionAuditCheck passes with the checked-in production allowlist", () => {
  const repoRoot = resolve(__dirname, "../..");
  const exitCode = runProductionAuditCheck({
    repoRoot,
    allowlistPath: ALLOWLIST_PATH,
    auditReportPath: resolve(FIXTURES_DIR, "current-production-audit.json"),
  });
  assert.equal(exitCode, 0);
});

test("runProductionAuditCheck fails when a new high advisory is not allowlisted", () => {
  const repoRoot = resolve(__dirname, "../..");
  const exitCode = runProductionAuditCheck({
    repoRoot,
    allowlistPath: ALLOWLIST_PATH,
    auditReportPath: resolve(FIXTURES_DIR, "with-unallowlisted-advisory.json"),
  });
  assert.equal(exitCode, 1);
});
