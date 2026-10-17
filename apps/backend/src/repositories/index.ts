// createReadRepositories(pool) and the ReadRepositories type.

import type { Pool } from 'pg';
import { createEmployeeRepository } from './employeeRepository.js';
import { createVisaRepository } from './visaRepository.js';
import { createRequestRepository } from './requestRepository.js';

export function createReadRepositories(pool: Pool) {
  return {
    employees: createEmployeeRepository(pool),
    visas: createVisaRepository(pool),
    requests: createRequestRepository(pool),
  };
}

export type ReadRepositories = ReturnType<typeof createReadRepositories>;
