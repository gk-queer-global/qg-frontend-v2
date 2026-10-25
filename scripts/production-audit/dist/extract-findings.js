"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractProductionFindings = void 0;
const BLOCKED_SEVERITIES = new Set(["high", "critical"]);
function ghsaFromAdvisoryUrl(url) {
    const parts = url.split("/");
    const id = parts[parts.length - 1];
    if (!id?.startsWith("GHSA-")) {
        throw new Error(`Expected GHSA id in advisory url, got: ${url}`);
    }
    return id;
}
function isAdvisoryVia(via) {
    return typeof via === "object" && via !== null && "url" in via;
}
function resolveAdvisories(report, packageName, visited) {
    if (visited.has(packageName)) {
        return [];
    }
    visited.add(packageName);
    const vulnerability = report.vulnerabilities[packageName];
    if (!vulnerability) {
        return [];
    }
    const advisories = [];
    for (const via of vulnerability.via) {
        if (isAdvisoryVia(via)) {
            advisories.push(via);
        }
        else {
            advisories.push(...resolveAdvisories(report, via, visited));
        }
    }
    return advisories;
}
function toProductionFinding(advisory) {
    return {
        id: ghsaFromAdvisoryUrl(advisory.url),
        package: advisory.name,
        severity: advisory.severity,
        title: advisory.title,
    };
}
function extractProductionFindings(report) {
    const findingsByKey = new Map();
    for (const [packageName, vulnerability] of Object.entries(report.vulnerabilities)) {
        if (!BLOCKED_SEVERITIES.has(vulnerability.severity)) {
            continue;
        }
        const advisories = resolveAdvisories(report, packageName, new Set());
        for (const advisory of advisories) {
            if (!BLOCKED_SEVERITIES.has(advisory.severity)) {
                continue;
            }
            const finding = toProductionFinding(advisory);
            findingsByKey.set(`${finding.id}|${finding.package}`, finding);
        }
    }
    return [...findingsByKey.values()].sort((a, b) => {
        const byId = a.id.localeCompare(b.id);
        return byId !== 0 ? byId : a.package.localeCompare(b.package);
    });
}
exports.extractProductionFindings = extractProductionFindings;
