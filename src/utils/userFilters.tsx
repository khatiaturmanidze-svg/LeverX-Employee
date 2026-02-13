import { IEmployee } from "../types/type";
import type { SearchCriteria } from "../components/Main/SearchBasic";
import type { AdvancedSearchCriteria } from "../components/Main/SearchAdvanced";
import { useMemo } from "react";

export const filterUsers = (
  users: IEmployee[],
  criteria: SearchCriteria,
): IEmployee[] => {
  const searchFullName = criteria.fullname.trim().toLowerCase();
  if (!searchFullName) return users;
  return users.filter((u) =>
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchFullName),
  );
};

export const filterAdvancedUsers = (
  users: IEmployee[],
  criteria: AdvancedSearchCriteria,
): IEmployee[] => {
  const name = criteria.name?.trim().toLowerCase() || "";
  const email = criteria.email?.trim().toLowerCase() || "";
  const phone = criteria.phone?.trim() || "";
  const zoom = criteria.zoom?.trim() || "";
  const building = criteria.building?.trim().toLowerCase() || "any";
  const room = criteria.room?.trim() || "";
  const department = criteria.department?.trim().toLowerCase() || "any";
  return users.filter((u) => {
    const userFullName = `${u.first_name} ${u.last_name}`.toLowerCase();
    const userRoom = u.room?.toString() || "";
    return (
      (!name || userFullName.includes(name)) &&
      (!email || u.email.toLowerCase() === email) &&
      (!phone || u.phone === phone) &&
      (!zoom || u.zoom_id === zoom) &&
      (building === "any" || u.building.toLowerCase() === building) &&
      (!room || userRoom === room) &&
      (department === "any" || u.department.toLowerCase() === department)
    );
  });
};

export function useFilteredItems<IEmployee, TValue>(
  allUsers: IEmployee[],
  value: TValue,
  filterFn: (user: IEmployee, value: TValue) => boolean,
): IEmployee[] {
  return useMemo(
    () => allUsers.filter((user) => filterFn(user, value)),
    [allUsers, value, filterFn],
  );
}
