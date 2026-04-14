import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmployeeContainer from './EmployeeContainer';
import { employeeContainerMockUsers, sharedUiNavigateMock } from './test-mocks';

vi.mock(
  'react-router-dom',
  async () => (await import('./test-mocks')).employeeContainerRouterModule,
);

vi.mock(
  './EmployeeCard',
  async () =>
    (await import('./test-mocks')).employeeContainerEmployeeCardModule,
);

vi.mock(
  './ListHeader',
  async () => (await import('./test-mocks')).employeeContainerListHeaderModule,
);

describe('EmployeeContainer', () => {
  it('renders all employees', () => {
    render(
      <EmployeeContainer users={employeeContainerMockUsers} viewMode="grid" />,
    );

    const cards = screen.getAllByTestId('employee-card');
    expect(cards).toHaveLength(2);
  });

  it('renders ListHeader only in list mode', () => {
    const { rerender } = render(
      <EmployeeContainer users={employeeContainerMockUsers} viewMode="grid" />,
    );

    expect(screen.queryByTestId('list-header')).not.toBeInTheDocument();

    rerender(
      <EmployeeContainer users={employeeContainerMockUsers} viewMode="list" />,
    );

    expect(screen.getByTestId('list-header')).toBeInTheDocument();
  });

  it('uses correct container class based on viewMode', () => {
    const { container, rerender } = render(
      <EmployeeContainer users={employeeContainerMockUsers} viewMode="grid" />,
    );

    expect(container.firstChild).toHaveClass('employee-grid__container');

    rerender(
      <EmployeeContainer users={employeeContainerMockUsers} viewMode="list" />,
    );

    expect(container.firstChild).toHaveClass('employee-menu__container');
  });

  it('navigates to details page when employee is clicked', () => {
    render(
      <EmployeeContainer users={employeeContainerMockUsers} viewMode="grid" />,
    );

    const cards = screen.getAllByTestId('employee-card');

    cards[0].click();

    expect(sharedUiNavigateMock).toHaveBeenCalledWith('/details/1');
  });
});
