import type {
  AuditAdvisoryVia,
  AuditVia,
  NpmAuditReport,
  ProductionFinding,
  Severity,
} from "./types";

const BLOCKED_SEVERITIES: ReadonlySet<Severity> = new Set(["high", "critical"]);

function ghsaFromAdvisoryUrl(url: string): string {
  const parts = url.split("/");
  const id = parts[parts.length - 1];
  if (!id?.startsWith("GHSA-")) {
    throw new Error(`Expected GHSA id in advisory url, got: ${url}`);
  }
  return id;
}

function isAdvisoryVia(via: AuditVia): via is AuditAdvisoryVia {
  return typeof via === "object" && via !== null && "url" in via;
}

function resolveAdvisories(
  report: NpmAuditReport,
  packageName: string,
  visited: Set<string>,
): AuditAdvisoryVia[] {
  if (visited.has(packageName)) {
    return [];
  }
  visited.add(packageName);

  const vulnerability = report.vulnerabilities[packageName];
  if (!vulnerability) {
    return [];
  }

  const advisories: AuditAdvisoryVia[] = [];
  for (const via of vulnerability.via) {
    if (isAdvisoryVia(via)) {
      advisories.push(via);
    } else {
      advisories.push(...resolveAdvisories(report, via, visited));
    }
  }
  return advisories;
}

function toProductionFinding(advisory: AuditAdvisoryVia): ProductionFinding {
  return {
    id: ghsaFromAdvisoryUrl(advisory.url),
    package: advisory.name,
    severity: advisory.severity,
    title: advisory.title,
  };
}

export function extractProductionFindings(report: NpmAuditReport): ProductionFinding[] {
  const findingsByKey = new Map<string, ProductionFinding>();

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
