type LogLevel = "info" | "error";

interface LogPayload {
  level: LogLevel;
  event: string;
  [key: string]: unknown;
}

export function logJson(payload: LogPayload): void {
  process.stdout.write(`${JSON.stringify({ ...payload, ts: new Date().toISOString() })}\n`);
}

export function logError(event: string, details: Record<string, unknown> = {}): void {
  logJson({ level: "error", event, ...details });
}

export function logInfo(event: string, details: Record<string, unknown> = {}): void {
  logJson({ level: "info", event, ...details });
}
