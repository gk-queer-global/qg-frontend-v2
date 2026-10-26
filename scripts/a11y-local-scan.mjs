#!/usr/bin/env node
/**
 * Local accessibility scan against a production build served over HTTP.
 * Usage (from repo root):
 *   npm run build
 *   npx serve -s build -l 4173
 *   node scripts/a11y-local-scan.mjs --base-url http://127.0.0.1:4173
 */
import process from 'node:process';

const DEFAULT_PATHS = [
  '/',
  '/about',
  '/donate',
  '/blog',
  '/add-resource',
  '/search',
];

const parseArgs = () => {
  const args = process.argv.slice(2);
  let baseUrl = 'http://127.0.0.1:4173';
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--base-url' && args[index + 1]) {
      baseUrl = args[index + 1];
      index += 1;
    }
  }
  return { baseUrl };
};

const logJson = (payload) => {
  process.stdout.write(`${JSON.stringify({ ...payload, ts: new Date().toISOString() })}\n`);
};

const logError = (message, detail) => {
  process.stderr.write(
    `${JSON.stringify({ level: 'error', message, detail, ts: new Date().toISOString() })}\n`
  );
};

const main = async () => {
  const { baseUrl } = parseArgs();
  let chromium;
  let AxeBuilder;
  try {
    ({ chromium } = await import('playwright'));
    ({ AxeBuilder } = await import('@axe-core/playwright'));
  } catch (error) {
    logError(
      'Missing Playwright or @axe-core/playwright. Install with: npm install --no-save playwright @axe-core/playwright',
      error instanceof Error ? error.message : String(error)
    );
    process.exitCode = 2;
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  let criticalCount = 0;

  for (const path of DEFAULT_PATHS) {
    try {
      await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const violations = results.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        nodes: violation.nodes.length,
      }));
      criticalCount += violations.filter((violation) => violation.impact === 'critical').length;
      logJson({ event: 'axe_scan', path, violationCount: violations.length, violations });
    } catch (error) {
      logError(`Scan failed for ${path}`, error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  }

  await browser.close();

  if (criticalCount > 0) {
    logJson({ event: 'summary', criticalCount, outcome: 'critical_violations_present' });
    process.exitCode = 1;
  } else {
    logJson({ event: 'summary', criticalCount, outcome: 'no_critical_violations_on_desktop_routes' });
  }
};

main().catch((error) => {
  logError('Unhandled scan failure', error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
