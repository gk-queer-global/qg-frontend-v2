import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import About from '../components/about/About';

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

  it('uses navigation links with clear names instead of unnamed buttons', () => {
    render(<About />);
    const main = screen.getByRole('main');

    expect(
      within(main).getByRole('link', { name: /SEE VOLUNTEER OPPORTUNITIES/i })
    ).toHaveAttribute('href', '/get-involved');
    expect(
      within(main).getByRole('link', {
        name: /SEND US YOUR PHOTO OR ARTWORK/i,
      })
    ).toHaveAttribute('href', '/contact-us');
    expect(
      within(main).getByRole('link', { name: /ADD A RESOURCE/i })
    ).toHaveAttribute('href', '/add-resource');
    expect(within(main).queryByRole('button')).not.toBeInTheDocument();
  });
});
