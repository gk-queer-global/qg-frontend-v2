import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import Homepage from '../components/homepage/Homepage';

const IMAGE_ALT_RULE = {
  runOnly: {
    type: 'rule' as const,
    values: ['image-alt'],
  },
};

describe('Homepage image accessibility', () => {
  it('passes jest-axe image-alt on the home page content', async () => {
    const { container } = render(<Homepage />);
    const results = await axe(container, IMAGE_ALT_RULE);
    expect(results).toHaveNoViolations();
  });

  it('describes the hero image beside the Hi greeting', () => {
    render(<Homepage />);
    expect(
      screen.getByAltText(
        /Queer Global community member smiling beside the site greeting/i
      )
    ).toBeInTheDocument();
  });

  it('describes community photos in the lower image band', () => {
    render(<Homepage />);
    expect(
      screen.getByAltText(/Two LGBTQIA\+ people laughing together outdoors/i)
    ).toBeInTheDocument();
    expect(
      screen.getByAltText(
        /Group of LGBTQIA\+ people celebrating at a pride event/i
      )
    ).toBeInTheDocument();
  });

  it('describes the middle promotional community image', () => {
    render(<Homepage />);
    expect(
      screen.getByAltText(
        /Diverse Queer Global members representing inclusive community faces/i
      )
    ).toBeInTheDocument();
  });
});
