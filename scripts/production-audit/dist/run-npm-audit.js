"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runNpmProductionAudit = void 0;
const node_child_process_1 = require("node:child_process");
function runNpmProductionAudit(options) {
    const npm = options.npmExecutable ?? "npm";
    const result = (0, node_child_process_1.spawnSync)(npm, ["audit", "--omit=dev", "--json"], {
        cwd: options.cwd,
        encoding: "utf8",
        maxBuffer: 20 * 1024 * 1024,
    });
    const stdout = result.stdout?.trim();
    if (!stdout) {
        throw new Error(`npm audit produced no stdout (status=${result.status}, stderr=${result.stderr?.slice(0, 500) ?? ""})`);
    }
    let parsed;
    try {
        parsed = JSON.parse(stdout);
    }
    catch (error) {
        throw new Error(`npm audit stdout was not valid JSON: ${String(error)}`);
    }
    if (typeof parsed !== "object" || parsed === null || !("vulnerabilities" in parsed)) {
        throw new Error("npm audit JSON missing vulnerabilities map");
    }
    return parsed;
}
exports.runNpmProductionAudit = runNpmProductionAudit;
