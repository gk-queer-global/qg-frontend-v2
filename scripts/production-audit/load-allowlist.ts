import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { AllowlistFile } from "./types";

export function loadAllowlistFile(allowlistPath: string): AllowlistFile {
  const absolutePath = resolve(allowlistPath);
  const raw = readFileSync(absolutePath, "utf8");
  const parsed = JSON.parse(raw) as AllowlistFile;

  if (parsed.version !== 1 || !Array.isArray(parsed.entries)) {
    throw new Error(`Unsupported allowlist format at ${absolutePath}`);
  }

  for (const entry of parsed.entries) {
    if (!entry.id.startsWith("GHSA-") || !entry.package || !entry.note) {
      throw new Error(`Invalid allowlist entry: ${JSON.stringify(entry)}`);
    }
  }

  return parsed;
}
