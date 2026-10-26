// Compose SQL repositories around the application's shared connection pool.

import type { Pool } from 'pg';
import { createEmployeeRepository } from './employeeRepository.js';
import { createVisaRepository } from './visaRepository.js';
import { createRequestRepository } from './requestRepository.js';
import { createAuthRepository } from './authRepository.js';

export function createRepositories(pool: Pool) {
  return {
    employees: createEmployeeRepository(pool),
    visas: createVisaRepository(pool),
    requests: createRequestRepository(pool),
    auth: createAuthRepository(pool),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;
