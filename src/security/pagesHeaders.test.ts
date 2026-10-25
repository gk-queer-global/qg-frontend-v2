import path from 'path';
import {
  parseCloudflarePagesHeadersFile,
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

  it('ships _headers in the production build and CSP allows built index.html', () => {
    expect(() =>
      validatePagesSecurityHeadersAtPath(repoRoot, {
        requireBuiltCopy: true,
      }),
    ).not.toThrow();
  });
});
