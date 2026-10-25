"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAllowlistFile = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function loadAllowlistFile(allowlistPath) {
    const absolutePath = (0, node_path_1.resolve)(allowlistPath);
    const raw = (0, node_fs_1.readFileSync)(absolutePath, "utf8");
    const parsed = JSON.parse(raw);
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
exports.loadAllowlistFile = loadAllowlistFile;
