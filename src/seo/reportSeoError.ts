type SeoErrorContext = {
	operation: string;
	detail?: string;
};

export function reportSeoError(error: unknown, context: SeoErrorContext): void {
	const payload = {
		source: "seo",
		operation: context.operation,
		detail: context.detail,
		error: error instanceof Error ? error.message : String(error),
	};

	console.error(JSON.stringify(payload));

	const sentry = (
		globalThis as {
			Sentry?: { captureException: (err: unknown, scope?: unknown) => void };
		}
	).Sentry;
	if (sentry && error instanceof Error) {
		sentry.captureException(error, { extra: payload });
	}
}
