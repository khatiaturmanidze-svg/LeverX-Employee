import React, { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import Main from './Main';
import {
  advancedCriteriaValue,
  basicCriteriaValue,
  getLoggedInUserMock,
  mainUsers,
  resetMainSearchCriteria,
  useGetHeaderPropsMock,
  useGetUsersQueryMock,
} from './test-mocks';

vi.mock(
  '../features/usersApi',
  async () => (await import('./test-mocks')).pagesUsersApiModule,
);

vi.mock(
  '@shared/lib',
  async () => (await import('./test-mocks')).pagesSharedLibModule,
);

vi.mock('@shared/ui', async (importOriginal) => {
  const { mainSharedUiFactory } = await import('./test-mocks');
  return mainSharedUiFactory(importOriginal);
});

vi.mock(
  '@shared/ui/EmployeeHeader',
  async () => (await import('./test-mocks')).mainEmployeeHeaderModule,
);

vi.mock(
  '@shared/ui/EmployeeContainer',
  async () => (await import('./test-mocks')).mainEmployeeContainerModule,
);

vi.mock('@features/search', async (importOriginal) => {
  const { mainSearchFeatureFactory } = await import('./test-mocks');
  return mainSearchFeatureFactory(importOriginal);
});

vi.mock(
  '@features/search/ui/SearchBasic',
  async () => (await import('./test-mocks')).mainSearchBasicModule,
);

vi.mock(
  '@features/search/ui/SearchAdvanced',
  async () => (await import('./test-mocks')).mainSearchAdvancedModule,
);

describe('pages/Main', () => {
  const resolveLazySections = async () => {
    await act(async () => {
      await Promise.resolve();
    });
  };

  beforeEach(() => {
    resetMainSearchCriteria();
    useGetUsersQueryMock.mockReturnValue({ data: mainUsers });
    getLoggedInUserMock.mockReturnValue(null);
    useGetHeaderPropsMock.mockReturnValue({
      loggedUser: null,
      isAdmin: false,
    });
  });

  it('renders basic search by default and shows employees in grid mode', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Main));
    });
    await resolveLazySections();

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

  it('renders loading state while users are loading', async () => {
    useGetUsersQueryMock.mockReturnValue({ data: [], isLoading: true });
    useGetHeaderPropsMock.mockReturnValue({
      loggedUser: null,
      isAdmin: false,
      isLoading: true,
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Main));
    });

    expect(container.textContent).toContain('Loading...');
    expect(container.querySelector('img[alt="nothing found"]')).toBeFalsy();
    expect(
      container.querySelector('[data-testid="employee-header"]'),
    ).toBeFalsy();

    await act(async () => {
      root.unmount();
    });
  });

  it('switches filtered results when submitting basic search', async () => {
    basicCriteriaValue.fullname = 'Jane Doe';

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Main));
    });
    await resolveLazySections();

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
    advancedCriteriaValue.name = 'Nobody Matches';

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Main));
    });
    await resolveLazySections();

    const advancedTab = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent === 'advanced search',
    );
    if (!advancedTab) throw new Error('advanced search tab not found');

    await act(async () => {
      (advancedTab as HTMLButtonElement).click();
    });
    await resolveLazySections();

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
