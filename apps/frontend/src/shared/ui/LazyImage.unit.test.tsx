import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import LazyImage from './LazyImage';

describe('LazyImage', () => {
  it('renders an image with lazy loading attributes', () => {
    render(<LazyImage src="/photo.jpg" alt="Profile photo" />);

    const image = screen.getByRole('img', { name: 'Profile photo' });

    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
  });

  it('shows the image label as a fallback when loading fails', () => {
    const handleError = vi.fn();

    render(
      <LazyImage
        src="/missing.jpg"
        alt="Missing profile photo"
        className="avatar-section__img"
        onError={handleError}
      />,
    );

    fireEvent.error(screen.getByRole('img', { name: 'Missing profile photo' }));

    const fallback = screen.getByRole('img', {
      name: 'Missing profile photo',
    });

    expect(fallback).toHaveTextContent('Missing profile photo');
    expect(fallback).toHaveClass('avatar-section__img');
    expect(fallback).toHaveClass('lazy-image__fallback');
    expect(handleError).toHaveBeenCalledTimes(1);
  });

  it('uses aria-label as fallback text when it is provided', () => {
    const { container } = render(
      <LazyImage src="/missing.jpg" alt="" aria-label="Employee portrait" />,
    );

    fireEvent.error(container.querySelector('img') as HTMLImageElement);

    expect(screen.getByText('Employee portrait')).toBeInTheDocument();
  });
});
