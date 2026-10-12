// import { v4 as uuidv4 } from 'uuid';
import type { IVisa } from '../employeeTypes.js';
import type { Database } from './types.js';
import { ServiceError } from './serviceError.js';

export function createVisaService(db: Database) {
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
