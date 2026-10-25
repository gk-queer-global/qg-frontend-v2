import fs from 'fs';
import path from 'path';

export const PAGES_HEADERS_RELATIVE_PATH = path.join('public', '_headers');

export const REQUIRED_SECURITY_HEADER_NAMES = [
  'Content-Security-Policy',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy',
] as const;

export type RequiredSecurityHeaderName =
  (typeof REQUIRED_SECURITY_HEADER_NAMES)[number];

/** External origins the SPA uses today (keep in sync with public/_headers CSP). */
export const DOCUMENTED_EXTERNAL_ORIGINS = {
  stylesheets: ['https://fonts.googleapis.com'],
  fonts: ['https://fonts.gstatic.com'],
  images: [
    'https://external-content.duckduckgo.com',
    'https://cdn4.iconfinder.com',
  ],
} as const;

export type ParsedPagesHeaders = {
  pathPattern: string;
  headers: Map<string, string>;
};

function normalizeHeaderName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Parses a Cloudflare Pages `_headers` file (path rules plus indented headers).
 */
export function parseCloudflarePagesHeadersFile(
  content: string,
): ParsedPagesHeaders[] {
  const rules: ParsedPagesHeaders[] = [];
  let current: ParsedPagesHeaders | null = null;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (line.length === 0) {
      continue;
    }

    if (!/^\s/.test(rawLine)) {
      current = { pathPattern: line.trim(), headers: new Map() };
      rules.push(current);
      continue;
    }

    if (!current) {
      throw new Error('Header line before any path pattern');
    }

    const separatorIndex = line.indexOf(':');
    if (separatorIndex <= 0) {
      throw new Error(`Invalid header line: ${line.trim()}`);
    }

    const name = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    current.headers.set(normalizeHeaderName(name), value);
  }

  return rules;
}

export function readPagesHeadersFromRepo(repoRoot: string): string {
  const headersPath = path.join(repoRoot, PAGES_HEADERS_RELATIVE_PATH);
  if (!fs.existsSync(headersPath)) {
    throw new Error(`Missing ${PAGES_HEADERS_RELATIVE_PATH}`);
  }
  return fs.readFileSync(headersPath, 'utf8');
}

export function getGlobalHeadersRule(
  rules: ParsedPagesHeaders[],
): ParsedPagesHeaders {
  const globalRule = rules.find((rule) => rule.pathPattern === '/*');
  if (!globalRule) {
    throw new Error('Expected a /* path rule in _headers');
  }
  return globalRule;
}

export function assertRequiredSecurityHeaders(
  headers: Map<string, string>,
): void {
  for (const requiredName of REQUIRED_SECURITY_HEADER_NAMES) {
    const key = normalizeHeaderName(requiredName);
    const value = headers.get(key);
    if (!value || value.length === 0) {
      throw new Error(`Missing required header: ${requiredName}`);
    }
  }
}

type CspDirectives = Map<string, string[]>;

export function parseContentSecurityPolicy(csp: string): CspDirectives {
  const directives: CspDirectives = new Map();

  for (const segment of csp.split(';')) {
    const trimmed = segment.trim();
    if (!trimmed) {
      continue;
    }
    const parts = trimmed.split(/\s+/);
    const directiveName = parts[0]?.toLowerCase();
    if (!directiveName) {
      continue;
    }
    directives.set(directiveName, parts.slice(1));
  }

  return directives;
}

function directiveAllowsOrigin(
  directives: CspDirectives,
  directiveNames: string[],
  origin: string,
): boolean {
  for (const name of directiveNames) {
    const sources = directives.get(name);
    if (!sources) {
      continue;
    }
    if (sources.includes(origin) || sources.includes('*')) {
      return true;
    }
    if (origin.startsWith('https:') && sources.includes('https:')) {
      return true;
    }
  }
  return false;
}

export function assertCspCoversDocumentedOrigins(csp: string): void {
  const directives = parseContentSecurityPolicy(csp);

  for (const origin of DOCUMENTED_EXTERNAL_ORIGINS.stylesheets) {
    if (
      !directiveAllowsOrigin(directives, ['style-src', 'style-src-elem'], origin)
    ) {
      throw new Error(
        `CSP must allow stylesheet origin ${origin} (style-src / style-src-elem)`,
      );
    }
  }

  for (const origin of DOCUMENTED_EXTERNAL_ORIGINS.fonts) {
    if (!directiveAllowsOrigin(directives, ['font-src'], origin)) {
      throw new Error(`CSP must allow font origin ${origin} (font-src)`);
    }
  }

  for (const origin of DOCUMENTED_EXTERNAL_ORIGINS.images) {
    if (!directiveAllowsOrigin(directives, ['img-src'], origin)) {
      throw new Error(`CSP must allow image origin ${origin} (img-src)`);
    }
  }

  const scriptSrc = directives.get('script-src') ?? [];
  if (scriptSrc.includes("'unsafe-eval'")) {
    throw new Error(
      "CSP script-src must not include 'unsafe-eval' for production build",
    );
  }

  const frameAncestors = directives.get('frame-ancestors') ?? [];
  if (!frameAncestors.includes("'none'")) {
    throw new Error("CSP frame-ancestors must include 'none'");
  }
}

export function extractExternalAssetOriginsFromHtml(html: string): string[] {
  const origins = new Set<string>();
  const attrPattern =
    /(?:src|href)=["'](https?:\/\/[^"']+)["']/gi;

  let match: RegExpExecArray | null;
  while ((match = attrPattern.exec(html)) !== null) {
    const url = match[1];
    if (!url) {
      continue;
    }
    try {
      origins.add(new URL(url).origin);
    } catch {
      // ignore malformed URLs in tests
    }
  }

  return Array.from(origins).sort();
}

export function assertBuiltHtmlAllowedByCsp(
  html: string,
  csp: string,
): void {
  const directives = parseContentSecurityPolicy(csp);
  const externalOrigins = extractExternalAssetOriginsFromHtml(html);

  for (const origin of externalOrigins) {
    const allowed =
      directiveAllowsOrigin(directives, ['style-src', 'style-src-elem'], origin) ||
      directiveAllowsOrigin(directives, ['font-src'], origin) ||
      directiveAllowsOrigin(directives, ['script-src'], origin) ||
      directiveAllowsOrigin(directives, ['default-src'], origin);

    if (!allowed) {
      throw new Error(
        `Built index.html references ${origin}, which is not allowed by CSP`,
      );
    }
  }
}

export function validatePagesSecurityHeadersAtPath(
  repoRoot: string,
  options: { requireBuiltCopy: boolean },
): void {
  const content = readPagesHeadersFromRepo(repoRoot);
  const rules = parseCloudflarePagesHeadersFile(content);
  const globalRule = getGlobalHeadersRule(rules);
  assertRequiredSecurityHeaders(globalRule.headers);

  const csp = globalRule.headers.get('content-security-policy');
  if (!csp) {
    throw new Error('Content-Security-Policy header is empty');
  }
  assertCspCoversDocumentedOrigins(csp);

  if (options.requireBuiltCopy) {
    const builtHeaders = path.join(repoRoot, 'build', '_headers');
    if (!fs.existsSync(builtHeaders)) {
      throw new Error('build/_headers missing (run production build first)');
    }
    const builtHtmlPath = path.join(repoRoot, 'build', 'index.html');
    if (!fs.existsSync(builtHtmlPath)) {
      throw new Error('build/index.html missing (run production build first)');
    }
    const builtHtml = fs.readFileSync(builtHtmlPath, 'utf8');
    assertBuiltHtmlAllowedByCsp(builtHtml, csp);
  }
}
