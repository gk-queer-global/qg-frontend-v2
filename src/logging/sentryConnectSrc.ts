/**
 * CSP connect-src token for Sentry browser envelope posts.
 *
 * Derived from the public ingest host in REACT_APP_SENTRY_DSN
 * (https://<publicKey>@o<orgId>.ingest.sentry.io/<projectId>).
 */
export const SENTRY_BROWSER_INGEST_CONNECT_SRC =
	"https://*.ingest.sentry.io";
