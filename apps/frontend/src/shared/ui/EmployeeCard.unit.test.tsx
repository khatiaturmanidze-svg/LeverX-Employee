import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmployeeCard from './EmployeeCard';
import '@testing-library/jest-dom/vitest';
import { employeeCardMockUser } from './test-mocks';

vi.mock(
  './Wrapper',
  async () => (await import('./test-mocks')).employeeCardWrapperModule,
);

describe('EmployeeCard', () => {
  it('renders full name', () => {
    render(
      <EmployeeCard
        user={employeeCardMockUser}
        variant="grid"
        onClick={vi.fn()}
        key="1"
      />,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('calls onClick with user id when clicked', () => {
    const handleClick = vi.fn();

    render(
      <EmployeeCard
        user={employeeCardMockUser}
        variant="grid"
        onClick={handleClick}
        key="1"
      />,
    );

    fireEvent.click(screen.getByText('John Doe'));
    expect(handleClick).toHaveBeenCalledWith('123');
  });

  it('renders grid variant correctly', () => {
    render(
      <EmployeeCard
        user={employeeCardMockUser}
        variant="grid"
        onClick={vi.fn()}
        key="1"
      />,
    );

    expect(screen.getByAltText('briefcase icon')).toBeInTheDocument();
    expect(screen.getByAltText('door-icon')).toBeInTheDocument();
    expect(screen.getAllByText('Engineering')).toHaveLength(1);
    expect(screen.getByText('101')).toBeInTheDocument();
  });

  it('renders menu variant correctly', () => {
    render(
      <EmployeeCard
        user={employeeCardMockUser}
        variant="menu"
        onClick={vi.fn()}
        key="1"
      />,
    );

    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('101')).toBeInTheDocument();

    expect(screen.queryByAltText('briefcase icon')).not.toBeInTheDocument();
    expect(screen.queryByAltText('door-icon')).not.toBeInTheDocument();
  });
});
