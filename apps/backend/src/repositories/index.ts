import type { PrismaClient } from '../generated/prisma/client.js';
import { createEmployeeRepository } from './employeeRepository.js';
import { createVisaRepository } from './visaRepository.js';
import { createRequestRepository } from './requestRepository.js';
import { createAuthRepository } from './authRepository.js';

export function createRepositories(prisma: PrismaClient) {
  return {
    employees: createEmployeeRepository(prisma),
    visas: createVisaRepository(prisma),
    requests: createRequestRepository(prisma),
    auth: createAuthRepository(prisma),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;
