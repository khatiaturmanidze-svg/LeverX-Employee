import { useMemo, useState } from 'react';
import { IEmployee } from '../../types/type';
import {
  useGetUsersQuery,
  useUpdateEmployeeRoleMutation,
} from '../../features/usersApi';
import { getErrorMessage, getLoggedInUser } from './core';

export function useFilteredItems<TItem, TValue>(
  items: TItem[],
  value: TValue,
  filterFn: (user: TItem, value: TValue) => boolean,
): TItem[] {
  return useMemo(
    () => items.filter((item) => filterFn(item, value)),
    [items, value, filterFn],
  );
}

export function useRoleChange(loggedUser: IEmployee | null) {
  const [error, setError] = useState<string | null>(null);
  const isAdmin = useMemo(() => loggedUser?.role === 'Admin', [loggedUser]);
  const [updateRole, { isLoading }] = useUpdateEmployeeRoleMutation();

  const handleRoleChange = async (targetUser: string, newRole: string) => {
    if (!isAdmin) {
      setError('permission denied. only Admins can change roles.');
      return;
    }

    setError(null);
    try {
      await updateRole({ id: targetUser, newRole }).unwrap();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return { handleRoleChange, error, isAdmin, isLoading };
}

export function useGetManager(employeeId: string) {
  const { data: allUsers = [] } = useGetUsersQuery();

  const employeeObj = allUsers.find((u) => u._id === employeeId);

  return employeeObj?.manager;
}

export function useGetHeaderProps() {
  const { data: allUsers = [], isLoading } = useGetUsersQuery();
  const loggedUser = useMemo(() => {
    return getLoggedInUser(allUsers) || null;
  }, [allUsers]);
  const isAdmin = useMemo(() => loggedUser?.role === 'Admin', [loggedUser]);
  return { loggedUser, isAdmin, isLoading };
}

export function useCanEdit(targetUser: IEmployee | null) {
  const { data: allUsers = [] } = useGetUsersQuery();
  const loggedUser = useMemo(() => {
    return getLoggedInUser(allUsers) || null;
  }, [allUsers]);

  return useMemo(() => {
    if (!loggedUser) return false;
    return (
      loggedUser.role === 'Admin' || loggedUser._id === targetUser?.manager?.id
    );
  }, [loggedUser, targetUser]);
}
