import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Details from './Details';
import {
  canEditMock,
  detailsLoggedUser,
  detailsViewedEmployee,
  getLoggedInUserMock,
  updateEmployeeMock,
  useGetHeaderPropsMock,
  useGetEmployeeDetailsQueryMock,
  useGetUsersQueryMock,
  useParamsMock,
  useUpdateEmployeeMutationMock,
} from './test-mocks';

vi.mock(
  'react-router-dom',
  async () => (await import('./test-mocks')).detailsRouterModule,
);

vi.mock(
  '../features/usersApi',
  async () => (await import('./test-mocks')).detailsUsersApiModule,
);

vi.mock(
  '@shared/lib',
  async () => (await import('./test-mocks')).detailsSharedLibModule,
);

vi.mock('@shared/ui', async (importOriginal) => {
  const { detailsSharedUiFactory } = await import('./test-mocks');
  return detailsSharedUiFactory(importOriginal);
});

vi.mock(
  '@features/edit',
  async () => (await import('./test-mocks')).detailsFeatureModule,
);

describe('pages/Details', () => {
  const setupBaseMocks = () => {
    useParamsMock.mockReturnValue({ id: detailsViewedEmployee._id });
    useGetUsersQueryMock.mockReturnValue({ data: [detailsLoggedUser] });
    getLoggedInUserMock.mockReturnValue(detailsLoggedUser);
    useGetHeaderPropsMock.mockReturnValue({
      loggedUser: detailsLoggedUser,
      isAdmin: true,
    });
    useGetEmployeeDetailsQueryMock.mockReturnValue({
      data: detailsViewedEmployee,
      isLoading: false,
      isError: false,
    });

    updateEmployeeMock.mockReset();
    updateEmployeeMock.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
    useUpdateEmployeeMutationMock.mockReturnValue([updateEmployeeMock]);
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    updateEmployeeMock.mockReset();
    updateEmployeeMock.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
    useUpdateEmployeeMutationMock.mockReturnValue([updateEmployeeMock]);
    canEditMock.mockReset();
    getLoggedInUserMock.mockReset();
    useGetHeaderPropsMock.mockReset();
    useParamsMock.mockReset();
    useGetUsersQueryMock.mockReset();
    useGetEmployeeDetailsQueryMock.mockReset();
    // useUpdateEmployeeMutationMock is set above to avoid crashes on destructuring.
  });

  it('renders loading state while employee details are loading', async () => {
    useParamsMock.mockReturnValue({ id: detailsViewedEmployee._id });
    useGetUsersQueryMock.mockReturnValue({ data: [detailsLoggedUser] });
    getLoggedInUserMock.mockReturnValue(detailsLoggedUser);
    useGetHeaderPropsMock.mockReturnValue({
      loggedUser: detailsLoggedUser,
      isAdmin: true,
    });

    useGetEmployeeDetailsQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Details));
    });

    expect(container.textContent).toContain('Loading Employee Details...');
    expect(container.textContent).not.toContain('Employee not found');

    await act(async () => {
      root.unmount();
    });
  });

  it('renders "Employee not found" when employee details query errors', async () => {
    useParamsMock.mockReturnValue({ id: detailsViewedEmployee._id });
    useGetUsersQueryMock.mockReturnValue({ data: [detailsLoggedUser] });
    getLoggedInUserMock.mockReturnValue(detailsLoggedUser);
    useGetHeaderPropsMock.mockReturnValue({
      loggedUser: detailsLoggedUser,
      isAdmin: true,
    });

    useGetEmployeeDetailsQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Details));
    });

    expect(container.textContent).toContain('Employee not found');

    await act(async () => {
      root.unmount();
    });
  });

  it('renders view mode and switches to edit mode when edit is clicked', async () => {
    setupBaseMocks();
    canEditMock.mockReturnValue(true);

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Details));
    });

    expect(
      container.querySelector('[data-testid="employee-view"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="employee-edit-form"]'),
    ).toBeFalsy();

    const editBtn = container.querySelector(
      'button.avatar-section__edit',
    ) as HTMLButtonElement | null;
    expect(editBtn).toBeTruthy();

    await act(async () => {
      editBtn!.click();
    });

    expect(
      container.querySelector('[data-testid="employee-edit-form"]'),
    ).toBeTruthy();

    await act(async () => {
      root.unmount();
    });
  });

  it('copies link when clicked and then saves successfully in edit mode', async () => {
    setupBaseMocks();
    canEditMock.mockReturnValue(true);
    localStorage.setItem('loggedInUser', 'admin@example.com');

    const writeTextMock = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Details));
    });

    const copyBtn = container.querySelector(
      'button.avatar-section__copy',
    ) as HTMLButtonElement;

    await act(async () => {
      copyBtn.click();
    });

    expect(writeTextMock).toHaveBeenCalledWith(window.location.href);

    const editBtn = container.querySelector(
      'button.avatar-section__edit',
    ) as HTMLButtonElement;

    await act(async () => {
      editBtn.click();
    });

    const saveBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent === 'Save success',
    ) as HTMLButtonElement | undefined;
    if (!saveBtn) throw new Error('Save success button not found');

    await act(async () => {
      saveBtn.click();
    });

    expect(updateEmployeeMock).toHaveBeenCalledWith({
      id: detailsViewedEmployee._id,
      update: { department: 'IT-Updated' },
    });

    // After save succeeds, Details should exit edit mode.
    expect(
      container.querySelector('[data-testid="employee-view"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="employee-edit-form"]'),
    ).toBeFalsy();

    await act(async () => {
      root.unmount();
    });
  });
});
