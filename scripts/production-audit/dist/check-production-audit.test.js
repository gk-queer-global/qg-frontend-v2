"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const node_test_1 = __importDefault(require("node:test"));
const compare_allowlist_1 = require("./compare-allowlist");
const extract_findings_1 = require("./extract-findings");
const check_production_audit_1 = require("./check-production-audit");
const SCRIPT_ROOT = (0, node_path_1.resolve)(__dirname, "..");
const FIXTURES_DIR = (0, node_path_1.resolve)(SCRIPT_ROOT, "fixtures");
const ALLOWLIST_PATH = (0, node_path_1.resolve)(SCRIPT_ROOT, "production-audit-allowlist.json");
function loadFixture(name) {
    const raw = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(FIXTURES_DIR, name), "utf8");
    return JSON.parse(raw);
}
(0, node_test_1.default)("extractProductionFindings resolves transitive high advisories", () => {
    const report = loadFixture("minimal-audit-report.json");
    const findings = (0, extract_findings_1.extractProductionFindings)(report);
    strict_1.default.equal(findings.length, 1);
    strict_1.default.equal(findings[0]?.id, "GHSA-aaaa-bbbb-cccc-dddd");
});
(0, node_test_1.default)("compareAllowlist flags unallowlisted and stale entries", () => {
    const findings = (0, extract_findings_1.extractProductionFindings)(loadFixture("minimal-audit-report.json"));
    const allowlist = {
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
    const comparison = (0, compare_allowlist_1.compareAllowlist)(findings, allowlist);
    strict_1.default.equal(comparison.unallowlistedFindings.length, 1);
    strict_1.default.equal(comparison.staleAllowlistEntries.length, 1);
    strict_1.default.equal((0, compare_allowlist_1.buildCheckResult)(comparison).ok, false);
});
(0, node_test_1.default)("runProductionAuditCheck passes with the checked-in production allowlist", () => {
    const repoRoot = (0, node_path_1.resolve)(__dirname, "../..");
    const exitCode = (0, check_production_audit_1.runProductionAuditCheck)({
        repoRoot,
        allowlistPath: ALLOWLIST_PATH,
        auditReportPath: (0, node_path_1.resolve)(FIXTURES_DIR, "current-production-audit.json"),
    });
    strict_1.default.equal(exitCode, 0);
});
(0, node_test_1.default)("runProductionAuditCheck fails when a new high advisory is not allowlisted", () => {
    const repoRoot = (0, node_path_1.resolve)(__dirname, "../..");
    const exitCode = (0, check_production_audit_1.runProductionAuditCheck)({
        repoRoot,
        allowlistPath: ALLOWLIST_PATH,
        auditReportPath: (0, node_path_1.resolve)(FIXTURES_DIR, "with-unallowlisted-advisory.json"),
    });
    strict_1.default.equal(exitCode, 1);
});
