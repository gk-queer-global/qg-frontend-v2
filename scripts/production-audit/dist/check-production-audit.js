"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runProductionAuditCheck = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const compare_allowlist_1 = require("./compare-allowlist");
const extract_findings_1 = require("./extract-findings");
const json_logger_1 = require("./json-logger");
const load_allowlist_1 = require("./load-allowlist");
const run_npm_audit_1 = require("./run-npm-audit");
function defaultAllowlistPath() {
    return (0, node_path_1.resolve)(__dirname, "../production-audit-allowlist.json");
}
function loadAuditReport(path) {
    const raw = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(path), "utf8");
    return JSON.parse(raw);
}
function runProductionAuditCheck(options) {
    const repoRoot = (0, node_path_1.resolve)(options.repoRoot);
    const allowlistPath = options.allowlistPath ?? defaultAllowlistPath();
    try {
        const allowlist = (0, load_allowlist_1.loadAllowlistFile)(allowlistPath);
        const auditReport = options.auditReportPath
            ? loadAuditReport(options.auditReportPath)
            : (0, run_npm_audit_1.runNpmProductionAudit)({ cwd: repoRoot });
        const findings = (0, extract_findings_1.extractProductionFindings)(auditReport);
        const comparison = (0, compare_allowlist_1.compareAllowlist)(findings, allowlist);
        const result = (0, compare_allowlist_1.buildCheckResult)(comparison);
        (0, json_logger_1.logInfo)("production_audit_check_complete", {
            ok: result.ok,
            summary: result.summary,
            allowlistedFindings: result.comparison.allowlistedFindings,
            unallowlistedFindings: result.comparison.unallowlistedFindings,
            staleAllowlistEntries: result.comparison.staleAllowlistEntries,
        });
        if (!result.ok) {
            if (result.comparison.unallowlistedFindings.length > 0) {
                (0, json_logger_1.logError)("unallowlisted_production_advisories", {
                    findings: result.comparison.unallowlistedFindings,
                });
            }
            if (result.comparison.staleAllowlistEntries.length > 0) {
                (0, json_logger_1.logError)("stale_allowlist_entries", {
                    entries: result.comparison.staleAllowlistEntries,
                });
            }
            return 1;
        }
        return 0;
    }
    catch (error) {
        (0, json_logger_1.logError)("production_audit_check_failed", {
            message: error instanceof Error ? error.message : String(error),
        });
        return 1;
    }
}
exports.runProductionAuditCheck = runProductionAuditCheck;
if (require.main === module) {
    const repoRoot = process.argv[2] ? (0, node_path_1.resolve)(process.argv[2]) : (0, node_path_1.resolve)(__dirname, "../..");
    const allowlistFlagIndex = process.argv.indexOf("--allowlist");
    const auditFlagIndex = process.argv.indexOf("--audit-report");
    const allowlistPath = allowlistFlagIndex >= 0 ? (0, node_path_1.resolve)(process.argv[allowlistFlagIndex + 1]) : undefined;
    const auditReportPath = auditFlagIndex >= 0 ? (0, node_path_1.resolve)(process.argv[auditFlagIndex + 1]) : undefined;
    const exitCode = runProductionAuditCheck({
        repoRoot,
        allowlistPath,
        auditReportPath,
    });
    process.exit(exitCode);
}
