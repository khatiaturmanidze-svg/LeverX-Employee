/*Database result types and a small query-executor type for repositories. */
import type { IEmployee } from '../employeeTypes.js';

/**
 * employee data is stored across normalized employees, visas, and requests
 * tables. EmployeeRow describes the employee query result before the service
 * combines related data into the IEmployee response expected by the frontend.
 */

export type EmployeeRow = Omit<
  IEmployee,
  '_id' | 'manager' | 'visa' | 'requests' | 'date_birth' | 'isRemoteWork'
> & {
  id: string;
  manager_id: string | null;
  is_remote_work: boolean;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  source_position: number;
};
