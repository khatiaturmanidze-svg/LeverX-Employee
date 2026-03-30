import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import VisaEditorList from './VisaEditorList';
import { IVisa } from '../../../types/type';

describe('VisaEditorList', () => {
  it('returns null when visas is empty', () => {
    const html = renderToStaticMarkup(
      React.createElement(VisaEditorList, {
        visas: [],
        onVisaChange: vi.fn(),
      }),
    );

    expect(html).toBe('');
  });

  it('renders edit rows for each visa', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    const visas: IVisa[] = [
      {
        issuing_country: 'US',
        type: 'tourist',
        start_date: '2020-01-01',
        end_date: '2020-12-31',
      },
    ];

    await act(async () => {
      root.render(
        React.createElement(VisaEditorList, {
          visas,
          onVisaChange: vi.fn(),
        }),
      );
    });

    const issuingCountryInput = container.querySelector(
      'input#issuing_country',
    ) as HTMLInputElement | null;

    const typeInput = container.querySelector(
      'input#type',
    ) as HTMLInputElement | null;

    const startDateInput = container.querySelector(
      'input#start_date',
    ) as HTMLInputElement | null;

    const endDateInput = container.querySelector(
      'input#end_date',
    ) as HTMLInputElement | null;

    expect(issuingCountryInput).not.toBeNull();
    expect(typeInput).not.toBeNull();
    expect(startDateInput).not.toBeNull();
    expect(endDateInput).not.toBeNull();

    // React uses `defaultValue`, so the DOM input should expose it.
    expect(issuingCountryInput?.value).toBe('US');
    expect(typeInput?.value).toBe('tourist');

    await act(async () => {
      root.unmount();
    });
  });

  it('calls onVisaChange with index + field name when input changes', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    const visas: IVisa[] = [
      {
        issuing_country: 'US',
        type: 'tourist',
        start_date: '2020-01-01',
        end_date: '2020-12-31',
      },
    ];

    const onVisaChange = vi.fn();

    await act(async () => {
      root.render(
        React.createElement(VisaEditorList, {
          visas,
          onVisaChange,
        }),
      );
    });

    const issuingCountryInput = container.querySelector(
      'input#issuing_country',
    ) as HTMLInputElement;

    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set;
    if (!setter) throw new Error('Input value setter not found');

    await act(async () => {
      setter.call(issuingCountryInput, 'CA');
      issuingCountryInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(onVisaChange).toHaveBeenCalledWith(0, 'issuing_country', 'CA');

    await act(async () => {
      root.unmount();
    });
  });
});
