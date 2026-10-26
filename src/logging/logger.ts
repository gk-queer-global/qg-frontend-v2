export type LogLevel = "debug" | "info" | "warn" | "error";

export type StructuredLogContext = Record<
	string,
	string | number | boolean | null | undefined
>;

export type StructuredLogPayload = {
	level: LogLevel;
	event: string;
	timestamp: string;
} & StructuredLogContext;

function writeLog(level: LogLevel, payload: StructuredLogPayload): void {
	const line = JSON.stringify(payload);
	switch (level) {
		case "debug":
			console.debug(line);
			break;
		case "info":
			console.info(line);
			break;
		case "warn":
			console.warn(line);
			break;
		case "error":
			console.error(line);
			break;
		default: {
			const _exhaustive: never = level;
			return _exhaustive;
		}
	}
}

export function logStructured(
	level: LogLevel,
	event: string,
	context: StructuredLogContext = {},
): void {
	writeLog(level, {
		level,
		event,
		timestamp: new Date().toISOString(),
		...context,
	});
}
