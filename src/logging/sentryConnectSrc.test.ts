import {
	SENTRY_BROWSER_INGEST_CONNECT_SRC_PATTERNS,
	sentryIngestConnectSrcFromDsn,
} from './sentryConnectSrc';

describe('sentryIngestConnectSrcFromDsn', () => {
	it('maps global ingest DSN host to *.ingest.sentry.io', () => {
		expect(
			sentryIngestConnectSrcFromDsn(
				'https://publickey@o123456.ingest.sentry.io/789',
			),
		).toBe('https://*.ingest.sentry.io');
	});

	it('maps US ingest DSN host to *.ingest.us.sentry.io', () => {
		expect(
			sentryIngestConnectSrcFromDsn(
				'https://publickey@o123456.ingest.us.sentry.io/789',
			),
		).toBe('https://*.ingest.us.sentry.io');
	});

	it('returns null for empty or non-ingest DSN', () => {
		expect(sentryIngestConnectSrcFromDsn('')).toBeNull();
		expect(sentryIngestConnectSrcFromDsn('not-a-url')).toBeNull();
		expect(sentryIngestConnectSrcFromDsn('https://example.com/')).toBeNull();
	});

	it('static CSP patterns cover both regional ingest hostnames', () => {
		expect(SENTRY_BROWSER_INGEST_CONNECT_SRC_PATTERNS).toContain(
			sentryIngestConnectSrcFromDsn(
				'https://publickey@o1.ingest.sentry.io/1',
			),
		);
		expect(SENTRY_BROWSER_INGEST_CONNECT_SRC_PATTERNS).toContain(
			sentryIngestConnectSrcFromDsn(
				'https://publickey@o1.ingest.us.sentry.io/1',
			),
		);
	});
});
