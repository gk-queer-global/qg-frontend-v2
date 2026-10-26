import type { AllowlistEntry, ProductionFinding } from "./types";

export function findingKey(finding: Pick<ProductionFinding, "id" | "package">): string {
  return `${finding.id}|${finding.package}`;
}

export function entryKey(entry: Pick<AllowlistEntry, "id" | "package">): string {
  return `${entry.id}|${entry.package}`;
}
