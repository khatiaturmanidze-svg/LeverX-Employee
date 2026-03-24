import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { FormGroup } from './FormGroup';

describe('FormGroup', () => {
  it('renders label and children inside form-group wrapper', () => {
    const html = renderToStaticMarkup(
      React.createElement(FormGroup, {
        label: 'Email',
        children: React.createElement('input', {
          type: 'email',
          name: 'email',
        }),
      }),
    );

    expect(html).toContain('class="form-group"');
    expect(html).toContain('<label>Email</label>');
    expect(html).toContain('type="email"');
    expect(html).toContain('name="email"');
  });
});
