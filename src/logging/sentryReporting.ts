import * as Sentry from "@sentry/react";

import type { StructuredLogContext } from "./logger";

const sentryExtraContextKeys = new Set([
	"feature",
	"reason",
	"status",
	"httpStatus",
]);

function sanitizeContext(
	context: StructuredLogContext,
): Record<string, string | number | boolean> {
	const sanitized: Record<string, string | number | boolean> = {};
	for (const [key, value] of Object.entries(context)) {
		if (!sentryExtraContextKeys.has(key)) {
			continue;
		}
		if (
			typeof value === "string" ||
			typeof value === "number" ||
			typeof value === "boolean"
		) {
			sanitized[key] = value;
		}
	}
	return sanitized;
}

export function isSentryEnabled(): boolean {
	const dsn = process.env.REACT_APP_SENTRY_DSN;
	return typeof dsn === "string" && dsn.trim().length > 0;
}

export function initSentry(): void {
	if (!isSentryEnabled()) {
		return;
	}

	Sentry.init({
		dsn: process.env.REACT_APP_SENTRY_DSN,
		enabled: true,
		sendDefaultPii: false,
	});
}

export function captureUnexpectedError(
	error: unknown,
	context: StructuredLogContext = {},
): void {
	if (!isSentryEnabled()) {
		return;
	}

	const normalizedError =
		error instanceof Error ? error : new Error("Unexpected navbar user error");

	Sentry.withScope((scope) => {
		const extras = sanitizeContext(context);
		for (const [key, value] of Object.entries(extras)) {
			scope.setExtra(key, value);
		}
		Sentry.captureException(normalizedError);
	});
}
