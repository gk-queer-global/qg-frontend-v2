/**
 * CSP connect-src tokens for Sentry browser envelope posts.
 *
 * Derived from the public ingest host in REACT_APP_SENTRY_DSN
 * (https://<publicKey>@o<orgId>.ingest[.us].sentry.io/<projectId>).
 */

/** connect-src entries covering EU/global and US Sentry ingest hostnames. */
export const SENTRY_BROWSER_INGEST_CONNECT_SRC_PATTERNS = [
	"https://*.ingest.sentry.io",
	"https://*.ingest.us.sentry.io",
] as const;

/** @deprecated Prefer SENTRY_BROWSER_INGEST_CONNECT_SRC_PATTERNS */
export const SENTRY_BROWSER_INGEST_CONNECT_SRC =
	SENTRY_BROWSER_INGEST_CONNECT_SRC_PATTERNS[0];

/**
 * Maps a public Sentry DSN to the CSP connect-src host wildcard for its ingest region.
 * Returns null when the DSN is missing or not a Sentry ingest URL.
 */
export function sentryIngestConnectSrcFromDsn(dsn: string): string | null {
	const trimmed = dsn.trim();
	if (trimmed.length === 0) {
		return null;
	}

	let hostname: string;
	try {
		hostname = new URL(trimmed).hostname;
	} catch {
		return null;
	}

	const match = hostname.match(/^[^.]+\.(ingest(?:\.[a-z]{2})?\.sentry\.io)$/);
	if (!match) {
		return null;
	}

	return `https://*.${match[1]}`;
}
