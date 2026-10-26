import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import Footer from '../components/common/footer/Footer';
import Donate from '../components/donate/Donate';
import Blog from '../components/blog/Blog';
import AddResource from '../components/add-resource/AddResource';
import Search from '../components/search/Search';

const IMAGE_ALT_RULE = {
  runOnly: {
    type: 'rule' as const,
    values: ['image-alt'],
  },
};

describe('Public route footer images (shared chrome)', () => {
  it('passes image-alt on the footer logo and social icons', async () => {
    const { container } = render(<Footer />);
    const results = await axe(container, IMAGE_ALT_RULE);
    expect(results).toHaveNoViolations();
  });
});

describe('Stub public pages without standalone imagery', () => {
  const routesWithoutImages = [
    ['Donate', Donate],
    ['Blog', Blog],
    ['AddResource', AddResource],
    ['Search', Search],
  ] as const;

  it.each(routesWithoutImages)(
    '%s has no image-alt violations when rendered',
    async (_label, Component) => {
      const { container } = render(<Component />);
      const results = await axe(container, IMAGE_ALT_RULE);
      expect(results).toHaveNoViolations();
    }
  );
});
