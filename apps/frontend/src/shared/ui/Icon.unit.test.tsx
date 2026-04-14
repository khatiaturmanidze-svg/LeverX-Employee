import { render, screen } from '@testing-library/react';
import Icon from './Icon';
import { describe, it, expect } from 'vitest';

describe('Icon', () => {
  it('renders with correct props', () => {
    render(
      <Icon
        src="/test.png"
        alt="test icon"
        width={32}
        height={32}
        className="my-class"
      />,
    );

    const img = screen.getByAltText('test icon');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test.png');
    expect(img).toHaveAttribute('width', '32');
    expect(img).toHaveAttribute('height', '32');
    expect(img).toHaveClass('my-class');
  });
});
