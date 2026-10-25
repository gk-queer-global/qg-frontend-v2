import { entryKey, findingKey } from "./finding-key";
import type {
  AllowlistComparison,
  AllowlistEntry,
  AllowlistFile,
  CheckResult,
  ProductionFinding,
} from "./types";

function indexAllowlist(entries: AllowlistEntry[]): Map<string, AllowlistEntry> {
  const map = new Map<string, AllowlistEntry>();
  for (const entry of entries) {
    const key = entryKey(entry);
    if (map.has(key)) {
      throw new Error(`Duplicate allowlist entry key: ${key}`);
    }
    map.set(key, entry);
  }
  return map;
}

export function compareAllowlist(
  findings: ProductionFinding[],
  allowlist: AllowlistFile,
): AllowlistComparison {
  const allowlistByKey = indexAllowlist(allowlist.entries);
  const matchedAllowlistKeys = new Set<string>();

  const allowlistedFindings: ProductionFinding[] = [];
  const unallowlistedFindings: ProductionFinding[] = [];

  for (const finding of findings) {
    const key = findingKey(finding);
    if (allowlistByKey.has(key)) {
      matchedAllowlistKeys.add(key);
      allowlistedFindings.push(finding);
    } else {
      unallowlistedFindings.push(finding);
    }
  }

  const staleAllowlistEntries = allowlist.entries.filter(
    (entry) => !matchedAllowlistKeys.has(entryKey(entry)),
  );

  return {
    allowlistedFindings,
    unallowlistedFindings,
    staleAllowlistEntries,
  };
}

export function buildCheckResult(comparison: AllowlistComparison): CheckResult {
  const totalHighOrCriticalFindings =
    comparison.allowlistedFindings.length + comparison.unallowlistedFindings.length;

  const ok =
    comparison.unallowlistedFindings.length === 0 &&
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
