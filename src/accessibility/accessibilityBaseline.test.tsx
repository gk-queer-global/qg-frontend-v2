import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import App from '../App';

const violationIds = (results: Awaited<ReturnType<typeof axe>>): string[] =>
  results.violations.map((violation) => violation.id).sort();

describe('accessibility baseline (jest-axe in jsdom)', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ profileThumbnail: '', messages: 0 }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('does not flag color-contrast in jsdom (browser scan required for contrast)', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1280,
    });
    window.dispatchEvent(new Event('resize'));

    const { container } = render(<App />);
    const results = await axe(container);

    expect(violationIds(results)).toEqual([]);
  });

  it('records mobile navigation violation rule ids on the home route', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 390,
    });
    window.dispatchEvent(new Event('resize'));

    const { container } = render(<App />);
    const results = await axe(container);

    expect(violationIds(results)).toEqual(['aria-valid-attr-value', 'button-name']);
  });
});
