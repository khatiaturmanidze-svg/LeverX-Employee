import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Managers from './Managers';

vi.mock('./ManagerCard', () => ({
  default: () => React.createElement('div', null, 'No manager assigned.'),
}));

describe('Managers', () => {
  it('renders support header and manager card placeholder when no manager', () => {
    const html = renderToStaticMarkup(
      React.createElement(Managers, { loggedInUser: null }),
    );

    expect(html).toContain('Leave Request Support');
    expect(html).toContain(
      'Your dedicated manager is here to assist with leave requests',
    );
    expect(html).toContain('No manager assigned.');
  });
});
