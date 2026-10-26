import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import App from '../App';
import About from '../components/about/About';

const navigateAppTo = (path: string) => {
  window.history.pushState({}, 'Test page', path);
  window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
};

const INTERACTIVE_NAME_RULES = {
  runOnly: {
    type: 'rule' as const,
    values: ['button-name', 'link-name'],
  },
};

describe('About page action accessibility', () => {
  it('passes jest-axe button-name and link-name checks', async () => {
    const { container } = render(<About />);
    const results = await axe(container, INTERACTIVE_NAME_RULES);
    expect(results).toHaveNoViolations();
  });

  it('keeps volunteer and photo actions as named buttons until those routes exist', () => {
    const { container } = render(<About />);
    const aboutContent = within(container);

    expect(
      aboutContent.getByRole('button', { name: /SEE VOLUNTEER OPPORTUNITIES/i })
    ).toHaveAttribute('type', 'button');
    expect(
      aboutContent.getByRole('button', {
        name: /SEND US YOUR PHOTO OR ARTWORK/i,
      })
    ).toHaveAttribute('type', 'button');
    expect(
      aboutContent.queryByRole('link', { name: /SEE VOLUNTEER OPPORTUNITIES/i })
    ).not.toBeInTheDocument();
    expect(
      aboutContent.queryByRole('link', {
        name: /SEND US YOUR PHOTO OR ARTWORK/i,
      })
    ).not.toBeInTheDocument();
  });

  it('navigates to the add-resource page from the About action link', async () => {
    render(<App />);

    navigateAppTo('/about');
    await waitFor(() => {
      expect(screen.getByRole('main')).toHaveTextContent(/ABOUT US/i);
    });

    const addResourceLink = within(screen.getByRole('main')).getByRole('link', {
      name: /ADD A RESOURCE/i,
    });
    expect(addResourceLink).toHaveAttribute('href', '/add-resource');
    addResourceLink.addEventListener('click', (event) => {
      event.preventDefault();
      navigateAppTo('/add-resource');
    });
    await userEvent.click(addResourceLink);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /^resource$/i })
      ).toBeInTheDocument();
    });
  });
});
