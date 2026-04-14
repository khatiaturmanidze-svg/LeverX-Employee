import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import SearchBasic from './SearchBasic';

describe('SearchBasic', () => {
  it('submits entered fullname and resets input', async () => {
    const onSearchSubmit = vi.fn();
    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(SearchBasic, { onSearchSubmit }));
    });

    const input = container.querySelector(
      '.search-form__basic-full',
    ) as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set;
    if (!setter) throw new Error('Input value setter not found');

    await act(async () => {
      setter.call(input, 'John Doe');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(onSearchSubmit).toHaveBeenCalledWith({ fullname: 'John Doe' });
    expect(input.value).toBe('');

    await act(async () => {
      root.unmount();
    });
  });
});
