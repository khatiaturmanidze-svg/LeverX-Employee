import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { DetailRow } from './DetailRow';

describe('DetailRow', () => {
  it('renders readonly mode with value and icon', () => {
    const html = renderToStaticMarkup(
      React.createElement(DetailRow, {
        icon: 'mail',
        label: 'Email',
        value: 'user@example.com',
        isEditing: false,
        fieldName: 'email',
      }),
    );

    expect(html).toContain('Email:');
    expect(html).toContain('user@example.com');
    expect(html).toContain('alt="Email icon"');
    expect(html).not.toContain('edit-input');
  });

  it('renders edit mode and calls onValueChange with field name', async () => {
    const onValueChange = vi.fn();
    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(
        React.createElement(DetailRow, {
          icon: 'mail',
          label: 'Email',
          value: 'old@example.com',
          isEditing: true,
          fieldName: 'email',
          onValueChange,
        }),
      );
    });

    const input = container.querySelector('input') as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set;
    if (!setter) throw new Error('Input value setter not found');

    await act(async () => {
      setter.call(input, 'new@example.com');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(onValueChange).toHaveBeenCalledWith('email', 'new@example.com');

    await act(async () => {
      root.unmount();
    });
  });

  it('does not crash in edit mode without onValueChange callback', () => {
    const html = renderToStaticMarkup(
      React.createElement(DetailRow, {
        icon: 'department',
        label: 'Department',
        value: 'Engineering',
        isEditing: true,
        fieldName: 'department',
      }),
    );

    expect(html).toContain('for="department"');
    expect(html).toContain('class="edit-input"');
  });
});
