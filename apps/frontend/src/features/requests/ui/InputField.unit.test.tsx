import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { InputField } from './InputField';

describe('InputField', () => {
  it('renders input with provided type', () => {
    const html = renderToStaticMarkup(
      React.createElement(InputField, {
        type: 'email',
        onChange: () => {},
      }),
    );

    expect(html).toContain('type="email"');
  });

  it('renders error text when error is provided', () => {
    const html = renderToStaticMarkup(
      React.createElement(InputField, {
        type: 'text',
        onChange: () => {},
        error: 'Required field',
      }),
    );

    expect(html).toContain('form-error');
    expect(html).toContain('Required field');
  });

  it('calls onChange when input value changes', async () => {
    const onChange = vi.fn();
    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(
        React.createElement(InputField, {
          type: 'text',
          onChange,
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
      setter.call(input, 'hello');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
  });
});
