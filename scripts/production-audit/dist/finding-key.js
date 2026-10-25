"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entryKey = exports.findingKey = void 0;
function findingKey(finding) {
    return `${finding.id}|${finding.package}`;
}
exports.findingKey = findingKey;
function entryKey(entry) {
    return `${entry.id}|${entry.package}`;
}
exports.entryKey = entryKey;
