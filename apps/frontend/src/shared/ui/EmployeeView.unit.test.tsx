import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { EmployeeView } from './EmployeeView';
import { employeeViewMockUser } from './test-mocks';

afterEach(() => {
  cleanup();
});

vi.mock('@features/edit', async (importOriginal) => {
  const { employeeViewFeaturesEditFactory } = await import('./test-mocks');
  return employeeViewFeaturesEditFactory(importOriginal);
});

describe('EmployeeView', () => {
  it('renders general info correctly', () => {
    render(<EmployeeView user={employeeViewMockUser} />);

    const deptRow = screen.getByTestId('detail-Department');
    expect(deptRow).toHaveTextContent('Engineering');

    const dobRow = screen.getByTestId('detail-Date-Birth');
    expect(dobRow).toHaveTextContent('Jan'); // avoid locale pain

    const managerRow = screen.getByTestId('detail-Manager');
    expect(managerRow).toHaveTextContent('John Doe');
  });

  it('renders contacts correctly', () => {
    render(<EmployeeView user={employeeViewMockUser} />);

    const phoneRow = screen.getByTestId('detail-Phone');
    expect(phoneRow).toHaveTextContent('123-456-7890');

    const emailRow = screen.getByTestId('detail-Email');
    expect(emailRow).toHaveTextContent('john.doe@example.com');
  });

  it('renders visa info if available', () => {
    render(<EmployeeView user={employeeViewMockUser} />);

    const visasHeading = screen.getByRole('heading', { name: /visas/i });
    expect(visasHeading).toBeInTheDocument();

    const issuingCountryRow = screen.getByTestId('detail-Issuing-Country');
    expect(issuingCountryRow).toHaveTextContent('Canada');

    const typeRow = screen.getByTestId('detail-Type');
    expect(typeRow).toHaveTextContent('Work');

    const startDateRow = screen.getByTestId('detail-Start-Date');
    expect(startDateRow).toHaveTextContent('2023');

    const endDateRow = screen.getByTestId('detail-End-Date');
    expect(endDateRow).toHaveTextContent('2024');
  });

  it('renders fallback text for missing manager or date of birth', () => {
    const userWithoutManagerDOB = {
      ...employeeViewMockUser,
      manager: undefined,
      date_birth: undefined,
    };

    render(<EmployeeView user={userWithoutManagerDOB} />);

    const managerRow = screen.getByTestId('detail-Manager');
    expect(managerRow).toHaveTextContent(/no manager assigned/i);

    const dobRow = screen.getByTestId('detail-Date-Birth');
    expect(dobRow).toHaveTextContent(/no date of birth/i);
  });
});
