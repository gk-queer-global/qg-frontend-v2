"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInfo = exports.logError = exports.logJson = void 0;
function logJson(payload) {
    process.stdout.write(`${JSON.stringify({ ...payload, ts: new Date().toISOString() })}\n`);
}
exports.logJson = logJson;
function logError(event, details = {}) {
    logJson({ level: "error", event, ...details });
}
exports.logError = logError;
function logInfo(event, details = {}) {
    logJson({ level: "info", event, ...details });
}
exports.logInfo = logInfo;
