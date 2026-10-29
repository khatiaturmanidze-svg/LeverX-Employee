// The separate visa router remains deferred; employee responses use the same repository.
import type { Visa } from '../visaTypes.js';
import type { Repositories } from '../repositories/index.js';
import { ServiceError } from './serviceError.js';

export function createVisaService(repositories: Repositories) {
  // get /users/:id/visas
  async function listVisas(id: string): Promise<Visa[]> {
    const employee = await repositories.employees.findIdentity(id);
    if (!employee) {
      throw new ServiceError(401, { error: 'employee not found' });
    }

    return repositories.visas.listByEmployeeId(id);
  }

  return { listVisas };
}
