import path from 'path';
import { SENTRY_BROWSER_INGEST_CONNECT_SRC } from '../logging/sentryConnectSrc';
import {
  getGlobalHeadersRule,
  parseCloudflarePagesHeadersFile,
  parseContentSecurityPolicy,
  readPagesHeadersFromRepo,
  validatePagesSecurityHeadersAtPath,
} from './pagesHeaders';

const repoRoot = path.resolve(__dirname, '..', '..');

describe('Cloudflare Pages security headers', () => {
  it('parses the global /* rule with required headers', () => {
    const content = readPagesHeadersFromRepo(repoRoot);
    const rules = parseCloudflarePagesHeadersFile(content);
    expect(rules.map((rule) => rule.pathPattern)).toContain('/*');
    expect(() =>
      validatePagesSecurityHeadersAtPath(repoRoot, {
        requireBuiltCopy: false,
      }),
    ).not.toThrow();
  });

  it('allows Sentry ingest in connect-src for REACT_APP_SENTRY_DSN', () => {
    const content = readPagesHeadersFromRepo(repoRoot);
    const rules = parseCloudflarePagesHeadersFile(content);
    const csp = getGlobalHeadersRule(rules).headers.get(
      'content-security-policy',
    );
    expect(csp).toBeDefined();
    const directives = parseContentSecurityPolicy(csp ?? '');
    expect(directives.get('connect-src')).toContain(
      SENTRY_BROWSER_INGEST_CONNECT_SRC,
    );
  });

  it('ships _headers in the production build and CSP allows built index.html', () => {
    expect(() =>
      validatePagesSecurityHeadersAtPath(repoRoot, {
        requireBuiltCopy: true,
      }),
    ).not.toThrow();
  });
});
