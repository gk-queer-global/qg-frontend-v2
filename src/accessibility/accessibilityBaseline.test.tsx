import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';
import App, { AppRoutes } from '../App';

expect.extend(toHaveNoViolations);

const PAGE_STRUCTURE_RULES = [
  'bypass',
  'page-has-heading-one',
  'heading-order',
  'region',
] as const;

const violationIds = (results: { violations: { id: string }[] }): string[] =>
  results.violations.map((violation) => violation.id).sort();

const pageStructureViolations = (
  results: { violations: { id: string }[] }
): string[] =>
  violationIds(results).filter((id) =>
    (PAGE_STRUCTURE_RULES as readonly string[]).includes(id)
  );

const mockUserFetch = (): void => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({ profileThumbnail: '', messages: 0 }),
    })
  ) as jest.Mock;
};

const routedPaths = [
  '/',
  '/about',
  '/donate',
  '/profile',
  '/blog',
  '/add-resource',
  '/search',
  '/logout',
] as const;

describe('accessibility baseline (jest-axe in jsdom)', () => {
  beforeEach(() => {
    mockUserFetch();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe.each(routedPaths)('page structure rules on %s', (path) => {
    it('has no bypass, heading, or landmark region violations', async () => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        writable: true,
        value: 1280,
      });
      window.dispatchEvent(new Event('resize'));

      const { container } = render(
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      );

      const results = await axe(container, {
        runOnly: {
          type: 'rule',
          values: [...PAGE_STRUCTURE_RULES],
        },
      });

      expect(pageStructureViolations(results)).toEqual([]);
    });
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
