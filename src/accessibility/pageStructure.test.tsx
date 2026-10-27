import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App, { AppRoutes } from '../App';
import HomepageContents from '../components/homepageContents/HomepageContents';

const mockUserFetch = (): void => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({ profileThumbnail: '', messages: 0 }),
    })
  ) as jest.Mock;
};

const routedPages: { path: string; heading: RegExp }[] = [
  { path: '/', heading: /WE'RE QUEER GLOBAL/i },
  { path: '/about', heading: /ABOUT US/i },
  { path: '/donate', heading: /donate/i },
  { path: '/profile', heading: /profile/i },
  { path: '/blog', heading: /blog/i },
  { path: '/add-resource', heading: /resource/i },
  { path: '/search', heading: /search/i },
  { path: '/logout', heading: /logout/i },
];

const tabbableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

describe('page structure accessibility', () => {
  beforeEach(() => {
    mockUserFetch();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1280,
    });
    window.dispatchEvent(new Event('resize'));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe.each(routedPages)('route $path', ({ path, heading }) => {
    it('renders exactly one h1 and one main landmark', () => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(heading);
      expect(document.querySelectorAll('main#main-content')).toHaveLength(1);
    });
  });

  it('places the skip link first among tabbable elements and targets the main landmark', () => {
    render(<App />);

    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toHaveAttribute('href', '#main-content');

    const main = document.getElementById('main-content');
    expect(main?.tagName).toBe('MAIN');

    const tabbables = Array.from(document.querySelectorAll(tabbableSelector)).filter(
      (element) => element.getAttribute('tabindex') !== '-1'
    );
    expect(tabbables[0]).toBe(skipLink);
  });

  it('does not nest h2 headings inside HomepageContents', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    render(<HomepageContents />);

    const nestedHeadingWarnings = consoleError.mock.calls.filter(([message]) =>
      String(message).includes('cannot appear as a descendant of')
    );
    expect(nestedHeadingWarnings).toHaveLength(0);

    consoleError.mockRestore();
  });
});
