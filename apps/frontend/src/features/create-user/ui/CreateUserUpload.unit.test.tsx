import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import CreateUserUpload from './CreateUserUpload';

vi.mock('../api/createUserApi', () => ({
  useUploadSpreadsheetMutation: () => [vi.fn(), { isLoading: false }],
}));

describe('CreateUserUpload', () => {
  it('renders drag icon and upload button', () => {
    const html = renderToStaticMarkup(React.createElement(CreateUserUpload));

    expect(html).toContain('create-user-upload');
    expect(html).toContain('/svgs/drag-icon.svg');
    expect(html).toContain('drag and drop icon');
    expect(html).toContain('Upload a spreadsheet');
    expect(html).toContain('Drag and drop a spreadsheet here');
  });
});
