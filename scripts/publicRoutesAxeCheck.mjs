#!/usr/bin/env node
/**
 * Playwright + axe scan for WCAG color-contrast and target-size on public routes.
 * Requires a production build in ./build (CI runs `npm run build` first).
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const buildDir = path.join(repoRoot, 'build');

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/donate',
  '/blog',
  '/add-resource',
  '/search',
];

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'mobile', width: 390, height: 844 },
];

const WCAG_RULES = ['color-contrast', 'target-size'];

const getFreePort = () =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Could not allocate a free port'));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
    server.on('error', reject);
  });

const waitForServer = (url, timeoutMs) =>
  new Promise((resolve, reject) => {
    const started = Date.now();
    const poll = () => {
      http
        .get(url, (response) => {
          response.resume();
          if (response.statusCode && response.statusCode >= 200 && response.statusCode < 500) {
            resolve();
            return;
          }
          retry();
        })
        .on('error', retry);

      function retry() {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }
        setTimeout(poll, 250);
      }
    };
    poll();
  });

const startServer = (port) =>
  new Promise((resolve, reject) => {
    const baseUrl = `http://127.0.0.1:${port}`;
    const child = spawn(
      'npx',
      ['serve', '-s', buildDir, '-l', String(port)],
      {
        cwd: repoRoot,
        stdio: 'pipe',
        env: { ...process.env, CI: 'true' },
        detached: true,
      }
    );
    child.on('error', reject);
    waitForServer(`${baseUrl}/`, 60_000)
      .then(() => resolve({ child, baseUrl }))
      .catch((error) => {
        child.kill('SIGTERM');
        reject(error);
      });
  });

const run = async () => {
  if (!fs.existsSync(path.join(buildDir, 'index.html'))) {
    console.error('Missing build/index.html. Run `npm run build` first.');
    process.exitCode = 1;
    return;
  }

  const servePort = await getFreePort();
  const { child: serveProcess, baseUrl } = await startServer(servePort);
  const browser = await chromium.launch();
  const failures = [];

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();

      for (const route of PUBLIC_ROUTES) {
        await page.goto(`${baseUrl}${route}`, {
          waitUntil: 'networkidle',
          timeout: 60_000,
        });

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();

        const blocked = results.violations.filter((violation) =>
          WCAG_RULES.includes(violation.id)
        );

        if (blocked.length > 0) {
          failures.push({
            viewport: viewport.name,
            route,
            violations: blocked.map((violation) => ({
              id: violation.id,
              nodes: violation.nodes.length,
              samples: violation.nodes.slice(0, 3).map((node) => node.html.slice(0, 120)),
            })),
          });
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
    if (serveProcess.pid) {
      try {
        process.kill(-serveProcess.pid, 'SIGKILL');
      } catch {
        serveProcess.kill('SIGKILL');
      }
    }
  }

  if (failures.length > 0) {
    console.error(JSON.stringify({ event: 'axe_regression', failures }, null, 2));
    process.exit(1);
  }

  console.log(
    JSON.stringify({
      event: 'axe_regression',
      outcome: 'pass',
      routes: PUBLIC_ROUTES.length,
      viewports: VIEWPORTS.length,
    })
  );
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
