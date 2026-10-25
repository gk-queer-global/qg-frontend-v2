/**
 * @jest-environment node
 */
import { execFileSync } from 'child_process';
import path from 'path';

describe('public routes WCAG contrast and touch targets', () => {
  it('passes Playwright axe checks for color-contrast and target-size', () => {
    const scriptPath = path.join(__dirname, '../../scripts/publicRoutesAxeCheck.mjs');
    execFileSync(process.execPath, [scriptPath], {
      cwd: path.join(__dirname, '../..'),
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' },
    });
  });
});
