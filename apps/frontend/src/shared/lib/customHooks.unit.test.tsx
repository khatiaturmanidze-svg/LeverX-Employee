import { renderHook, act } from '@testing-library/react';
import {
  useCanEdit,
  useFilteredItems,
  useRoleChange,
  useGetManager,
} from './customHooks';
import { IEmployee } from '../../types/type';
import * as usersApi from '../../features/usersApi';
import { describe, it, expect, vi } from 'vitest';
const employees: IEmployee[] = [
  {
    _id: '1',
    role: 'Admin',
    user_avatar: '/avatars/john.png',
    first_name: 'John',
    last_name: 'Doe',
    department: 'IT',
    building: 'A',
    room: '101',
    desk_number: 1,
    isRemoteWork: false,
    email: 'john.doe@example.com',
    date_birth: { year: 1980, month: 5, day: 20 },
    manager: undefined,
    visa: [],
    requests: [],
  },
  {
    _id: '2',
    role: 'User',
    user_avatar: '/avatars/jane.png',
    first_name: 'Jane',
    last_name: 'Smith',
    department: 'IT',
    building: 'A',
    room: '102',
    desk_number: 2,
    isRemoteWork: true,
    email: 'jane.smith@example.com',
    date_birth: { year: 1990, month: 7, day: 15 },
    manager: { id: '1', first_name: 'John', last_name: 'Doe' },
    visa: [
      {
        issuing_country: 'USA',
        type: 'B1',
        start_date: '2023-01-01',
        end_date: '2023-12-31',
      },
    ],
    requests: [],
  },
];

const mockUpdateRole = vi.fn(() => ({ unwrap: () => Promise.resolve() }));

describe('useFilteredItems', () => {
  it('filters items correctly', () => {
    const { result } = renderHook(() =>
      useFilteredItems(employees, 'Admin', (user, val) => user.role === val),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].first_name).toBe('John');
  });
});

describe('useRoleChange', () => {
  vi.spyOn(usersApi, 'useUpdateEmployeeRoleMutation').mockReturnValue([
    mockUpdateRole,
    { isLoading: false },
  ] as unknown as ReturnType<typeof usersApi.useUpdateEmployeeRoleMutation>);

  it('allows admin to change role', async () => {
    const { result } = renderHook(() => useRoleChange(employees[0]));
    await act(async () => {
      await result.current.handleRoleChange('2', 'Admin');
    });
    expect(mockUpdateRole).toHaveBeenCalledWith({ id: '2', newRole: 'Admin' });
    expect(result.current.error).toBeNull();
  });

  it('denies non-admin role change', async () => {
    const { result } = renderHook(() => useRoleChange(employees[1]));
    await act(async () => {
      await result.current.handleRoleChange('2', 'Admin');
    });
    expect(result.current.error).toMatch(/permission denied/i);
  });
});

describe('useGetManager', () => {
  vi.spyOn(usersApi, 'useGetUsersQuery').mockReturnValue({
    data: employees,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof usersApi.useGetUsersQuery>);

  it('returns correct manager', () => {
    const { result } = renderHook(() => useGetManager('2'));
    expect(result.current?.first_name).toBe('John');
  });

  it('returns undefined if no manager', () => {
    const { result } = renderHook(() => useGetManager('1'));
    expect(result.current).toBeUndefined();
  });
});

describe('useCanEdit', () => {
  it('returns true for an admin user', () => {
    localStorage.setItem('loggedInUser', employees[0].email);
    vi.spyOn(usersApi, 'useGetUsersQuery').mockReturnValue({
      data: employees,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof usersApi.useGetUsersQuery>);

    const { result } = renderHook(() => useCanEdit(employees[1]));

    expect(result.current).toBe(true);
  });

  it('returns true for the target employee manager', () => {
    localStorage.setItem('loggedInUser', employees[0].email);
    vi.spyOn(usersApi, 'useGetUsersQuery').mockReturnValue({
      data: [{ ...employees[0], role: 'Manager' }, employees[1]],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof usersApi.useGetUsersQuery>);

    const { result } = renderHook(() => useCanEdit(employees[1]));

    expect(result.current).toBe(true);
  });

  it('returns false when logged-in user is neither admin nor manager', () => {
    const nonManager = {
      ...employees[0],
      _id: '3',
      role: 'Employee',
      email: 'other@example.com',
    };
    localStorage.setItem('loggedInUser', nonManager.email);
    vi.spyOn(usersApi, 'useGetUsersQuery').mockReturnValue({
      data: [nonManager, employees[1]],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof usersApi.useGetUsersQuery>);

    const { result } = renderHook(() => useCanEdit(employees[1]));

    expect(result.current).toBe(false);
  });
});
