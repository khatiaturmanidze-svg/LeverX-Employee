import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import SearchAdvanced from './SearchAdvanced';

describe('SearchAdvanced', () => {
  it('submits criteria and resets fields to defaults', async () => {
    const onSearchSubmit = vi.fn();
    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(SearchAdvanced, { onSearchSubmit }));
    });

    const nameInput = container.querySelector('#name') as HTMLInputElement;
    const emailInput = container.querySelector('#email') as HTMLInputElement;
    const buildingSelect = container.querySelector(
      '#building',
    ) as HTMLSelectElement;
    const roomInput = container.querySelector('#room') as HTMLInputElement;
    const departmentSelect = container.querySelector(
      '#department',
    ) as HTMLSelectElement;
    const form = container.querySelector('form') as HTMLFormElement;

    const setInput = (input: HTMLInputElement, value: string) => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )?.set;
      if (!setter) throw new Error('Input value setter not found');
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };

    await act(async () => {
      setInput(nameInput, 'Alice');
      setInput(emailInput, 'alice@company.com');
      setInput(roomInput, '202');
      buildingSelect.dispatchEvent(new Event('change', { bubbles: true }));
      departmentSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(onSearchSubmit).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@company.com',
      phone: '',
      zoom: '',
      building: 'any',
      room: '202',
      department: 'Any',
    });
    expect(nameInput.value).toBe('');
    expect(emailInput.value).toBe('');
    expect(roomInput.value).toBe('');
    expect(buildingSelect.value).toBe('any');
    expect(departmentSelect.value).toBe('Any');

    await act(async () => {
      root.unmount();
    });
  });
});
