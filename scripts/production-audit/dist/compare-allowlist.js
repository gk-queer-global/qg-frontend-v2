"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCheckResult = exports.compareAllowlist = void 0;
const finding_key_1 = require("./finding-key");
function indexAllowlist(entries) {
    const map = new Map();
    for (const entry of entries) {
        const key = (0, finding_key_1.entryKey)(entry);
        if (map.has(key)) {
            throw new Error(`Duplicate allowlist entry key: ${key}`);
        }
        map.set(key, entry);
    }
    return map;
}
function compareAllowlist(findings, allowlist) {
    const allowlistByKey = indexAllowlist(allowlist.entries);
    const matchedAllowlistKeys = new Set();
    const allowlistedFindings = [];
    const unallowlistedFindings = [];
    for (const finding of findings) {
        const key = (0, finding_key_1.findingKey)(finding);
        if (allowlistByKey.has(key)) {
            matchedAllowlistKeys.add(key);
            allowlistedFindings.push(finding);
        }
        else {
            unallowlistedFindings.push(finding);
        }
    }
    const staleAllowlistEntries = allowlist.entries.filter((entry) => !matchedAllowlistKeys.has((0, finding_key_1.entryKey)(entry)));
    return {
        allowlistedFindings,
        unallowlistedFindings,
        staleAllowlistEntries,
    };
}
exports.compareAllowlist = compareAllowlist;
function buildCheckResult(comparison) {
    const totalHighOrCriticalFindings = comparison.allowlistedFindings.length + comparison.unallowlistedFindings.length;
    const ok = comparison.unallowlistedFindings.length === 0 &&
        comparison.staleAllowlistEntries.length === 0;
    return {
        ok,
        comparison,
        summary: {
            totalHighOrCriticalFindings,
            allowlistedCount: comparison.allowlistedFindings.length,
            unallowlistedCount: comparison.unallowlistedFindings.length,
            staleAllowlistCount: comparison.staleAllowlistEntries.length,
        },
    };
}
exports.buildCheckResult = buildCheckResult;
