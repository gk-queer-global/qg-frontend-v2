export type Severity = "low" | "moderate" | "high" | "critical";

export interface AuditAdvisoryVia {
  source: number;
  name: string;
  dependency: string;
  title: string;
  url: string;
  severity: Severity;
}

export type AuditVia = string | AuditAdvisoryVia;

export interface AuditVulnerability {
  name: string;
  severity: Severity;
  isDirect: boolean;
  via: AuditVia[];
  effects: string[];
  range: string;
  nodes: string[];
  fixAvailable: boolean | { name: string; version: string; isSemVerMajor: boolean };
}

export interface NpmAuditReport {
  auditReportVersion: number;
  vulnerabilities: Record<string, AuditVulnerability>;
  metadata?: {
    vulnerabilities: Record<Severity, number>;
  };
}

export interface ProductionFinding {
  id: string;
  package: string;
  severity: Severity;
  title: string;
}

export interface AllowlistEntry {
  id: string;
  package: string;
  severity: Severity;
  note: string;
}

export interface AllowlistFile {
  version: number;
  entries: AllowlistEntry[];
}

export interface AllowlistComparison {
  allowlistedFindings: ProductionFinding[];
  unallowlistedFindings: ProductionFinding[];
  staleAllowlistEntries: AllowlistEntry[];
}

export interface CheckResult {
  ok: boolean;
  comparison: AllowlistComparison;
  summary: {
    totalHighOrCriticalFindings: number;
    allowlistedCount: number;
    unallowlistedCount: number;
    staleAllowlistCount: number;
  };
}
