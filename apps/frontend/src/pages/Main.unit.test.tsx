import React, { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import Main from './Main';
import type { AdvancedSearchCriteria, SearchCriteria } from '@features/search';
import type { IEmployee } from '../types/type';

const { useGetUsersQueryMock, useHeaderPropsMock } = vi.hoisted(() => ({
  useGetUsersQueryMock: vi.fn(),
  useHeaderPropsMock: vi.fn(),
}));

let basicCriteriaValue: SearchCriteria = { fullname: '' };
let advancedCriteriaValue: AdvancedSearchCriteria = {
  name: '',
  email: '',
  phone: '',
  zoom: '',
  building: 'any',
  room: '',
  department: 'any',
};

vi.mock('../features/usersApi', () => ({
  useGetUsersQuery: useGetUsersQueryMock,
}));

vi.mock('@shared/lib', () => ({
  useHeaderProps: useHeaderPropsMock,
}));

vi.mock('@shared/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/ui')>();

  return {
    ...actual,

    Header: () => React.createElement('header', null, 'Header'),

    EmployeeHeader: ({
      users,
      onViewChange,
    }: {
      users: IEmployee[];
      onViewChange: (mode: 'grid' | 'list') => void;
    }) =>
      React.createElement('div', { 'data-testid': 'employee-header' }, [
        React.createElement(
          'span',
          { key: 'count' },
          `employees:${users.length}`,
        ),
        React.createElement(
          'button',
          {
            key: 'toggle',
            type: 'button',
            onClick: () => onViewChange('list'),
          },
          'toggle-view',
        ),
      ]),

    EmployeeContainer: ({
      users,
      viewMode,
    }: {
      users: IEmployee[];
      viewMode: 'grid' | 'list';
    }) =>
      React.createElement(
        'div',
        { 'data-testid': 'employee-container' },
        `container:${users.length}:${viewMode}`,
      ),
  };
});

vi.mock('@features/search', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@features/search')>();

  return {
    ...actual,
    __esModule: true,

    SearchBasic: ({
      onSearchSubmit,
    }: {
      onSearchSubmit: (criteria: SearchCriteria) => void;
    }) =>
      React.createElement('div', { 'data-testid': 'basic-search' }, [
        React.createElement(
          'button',
          {
            key: 'submit-basic',
            type: 'button',
            onClick: () => onSearchSubmit(basicCriteriaValue),
          },
          'submit-basic',
        ),
      ]),

    SearchAdvanced: ({
      onSearchSubmit,
    }: {
      onSearchSubmit: (criteria: AdvancedSearchCriteria) => void;
    }) =>
      React.createElement('div', { 'data-testid': 'advanced-search' }, [
        React.createElement(
          'button',
          {
            key: 'submit-advanced',
            type: 'button',
            onClick: () => onSearchSubmit(advancedCriteriaValue),
          },
          'submit-advanced',
        ),
      ]),
  };
});

describe('pages/Main', () => {
  const users: IEmployee[] = [
    {
      _id: 'u-1',
      role: 'Employee',
      user_avatar: '',
      first_name: 'Jane',
      last_name: 'Doe',
      department: 'IT',
      building: 'A',
      room: '101',
      desk_number: 1,
      isRemoteWork: false,
      phone: '+1',
      email: 'jane@example.com',
      zoom_id: 'zoom1',
      zoom_link: 'link',
      citizenship: 'US',
    },
    {
      _id: 'u-2',
      role: 'Employee',
      user_avatar: '',
      first_name: 'John',
      last_name: 'Smith',
      department: 'HR',
      building: 'B',
      room: '102',
      desk_number: 2,
      isRemoteWork: false,
      phone: '+2',
      email: 'john@example.com',
      zoom_id: 'zoom2',
      zoom_link: 'link',
      citizenship: 'US',
    },
  ];

  beforeEach(() => {
    basicCriteriaValue = { fullname: '' };
    advancedCriteriaValue = {
      name: '',
      email: '',
      phone: '',
      zoom: '',
      building: 'any',
      room: '',
      department: 'any',
    };

    useGetUsersQueryMock.mockReturnValue({ data: users });
    useHeaderPropsMock.mockReturnValue({
      loggedInUser: null,
      isAdmin: false,
    });
  });

  it('renders basic search by default and shows employees in grid mode', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Main));
    });

    expect(
      container.querySelector('[data-testid="basic-search"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="advanced-search"]'),
    ).toBeFalsy();

    expect(container.textContent).toContain('employees:2');
    expect(container.textContent).toContain('container:2:grid');

    await act(async () => {
      const toggleBtn = container.querySelector(
        '[data-testid="employee-header"] button',
      ) as HTMLButtonElement;
      toggleBtn.click();
    });

    expect(container.textContent).toContain('container:2:list');

    await act(async () => {
      root.unmount();
    });
  });

  it('switches filtered results when submitting basic search', async () => {
    basicCriteriaValue = { fullname: 'Jane Doe' };

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Main));
    });

    await act(async () => {
      const submitBtn = container.querySelector(
        '[data-testid="basic-search"] button',
      ) as HTMLButtonElement;
      submitBtn.click();
    });

    // Jane Doe only
    expect(container.textContent).toContain('employees:1');
    expect(container.textContent).toContain('container:1:grid');

    await act(async () => {
      root.unmount();
    });
  });

  it('switches to advanced search and shows empty state when advanced criteria matches nothing', async () => {
    advancedCriteriaValue = {
      name: 'Nobody Matches',
      email: '',
      phone: '',
      zoom: '',
      building: 'any',
      room: '',
      department: 'any',
    };

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Main));
    });

    const advancedTab = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent === 'advanced search',
    );
    if (!advancedTab) throw new Error('advanced search tab not found');

    await act(async () => {
      (advancedTab as HTMLButtonElement).click();
    });

    expect(
      container.querySelector('[data-testid="advanced-search"]'),
    ).toBeTruthy();
    expect(container.querySelector('[data-testid="basic-search"]')).toBeFalsy();

    await act(async () => {
      const submitAdvancedBtn = container.querySelector(
        '[data-testid="advanced-search"] button',
      ) as HTMLButtonElement;
      submitAdvancedBtn.click();
    });

    expect(container.querySelector('img[alt="nothing found"]')).toBeTruthy();
    expect(
      container.querySelector('[data-testid="employee-container"]'),
    ).toBeFalsy();

    await act(async () => {
      root.unmount();
    });
  });
});
