// Deferred visa exercise. This service is not mounted by the SQL application.
import type { IVisa } from '../employeeTypes.js';
import type { LegacyJsonDatabase } from './types.js';
import { ServiceError } from './serviceError.js';

export function createVisaService(db: LegacyJsonDatabase) {
  // get /users/:id/visas
  async function listVisas(id: string): Promise<IVisa[]> {
    const employee = db.data.employees.find((emp) => emp._id === id);
    if (!employee) {
      throw new ServiceError(401, { error: 'employee not found' });
    }

    if (!employee.visa) {
      return [];
    }

    return employee.visa;
  }

  return { listVisas };
}
