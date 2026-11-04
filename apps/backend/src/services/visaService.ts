import type { Visa, VisaListQuery, VisaPage } from '../visaTypes.js';
import type { Repositories } from '../repositories/index.js';
import { toVisaResponse } from '../mappers/visaMapper.js';
import { ServiceError } from './serviceError.js';
import type { Prisma, PrismaClient } from '../generated/prisma/client.js';
import type { CreateVisaInput, UpdateVisaInput } from '../visaTypes.js';
import { parseCreateVisa } from '../schemas/visaSchema.js';
import { toStoredDate } from '../mappers/visaMapper.js';

export function createVisaService(
  prisma: PrismaClient,
  repositories: Repositories,
) {
  async function requireEmployee(employeeId: string) {
    const employee = await repositories.employees.findIdentity(employeeId);
    if (!employee) {
      throw new ServiceError(404, { error: 'employee not found' });
    }
  }

  async function listVisas(
    employeeId: string,
    query: VisaListQuery,
  ): Promise<VisaPage> {
    await requireEmployee(employeeId);
    const { rows, total } = await repositories.visas.listPageByEmployeeId(
      employeeId,
      query,
    );
    return {
      items: rows.map(toVisaResponse),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async function getVisa(employeeId: string, visaId: bigint): Promise<Visa> {
    await requireEmployee(employeeId);
    const row = await repositories.visas.findByEmployeeAndId(
      employeeId,
      visaId,
    );
    if (!row) {
      throw new ServiceError(404, { error: 'visa not found' });
    }
    return toVisaResponse(row);
  }
  async function requireEmployeeLock(
    employeeId: string,
    tx: Prisma.TransactionClient,
  ) {
    const exists = await repositories.visas.lockEmployee(employeeId, tx);
    if (!exists) {
      throw new ServiceError(404, { error: 'employee not found' });
    }
  }

  async function createVisa(
    employeeId: string,
    input: CreateVisaInput,
  ): Promise<Visa> {
    const row = await prisma.$transaction(async (tx) => {
      await requireEmployeeLock(employeeId, tx);
      return repositories.visas.createForEmployee(employeeId, input, tx);
    });
    return toVisaResponse(row);
  }

  async function updateVisa(
    employeeId: string,
    visaId: bigint,
    patch: UpdateVisaInput,
  ): Promise<Visa> {
    const row = await prisma.$transaction(async (tx) => {
      await requireEmployeeLock(employeeId, tx);
      const existing = await repositories.visas.findByEmployeeAndId(
        employeeId,
        visaId,
        tx,
      );
      if (!existing) {
        throw new ServiceError(404, { error: 'visa not found' });
      }

      const current = toVisaResponse(existing);
      const candidate = parseCreateVisa({
        issuing_country: current.issuing_country,
        type: current.type,
        start_date: current.start_date,
        end_date: current.end_date,
        ...patch,
      });

      const data: Prisma.VisaUpdateManyMutationInput = {
        ...(patch.issuing_country !== undefined
          ? { issuing_country: candidate.issuing_country }
          : {}),
        ...(patch.type !== undefined ? { type: candidate.type } : {}),
        ...(patch.start_date !== undefined
          ? { start_date: toStoredDate(candidate.start_date) }
          : {}),
        ...(patch.end_date !== undefined
          ? { end_date: toStoredDate(candidate.end_date) }
          : {}),
      };

      const updated = await repositories.visas.updateByEmployeeAndId(
        employeeId,
        visaId,
        data,
        tx,
      );
      if (!updated) {
        throw new ServiceError(404, { error: 'visa not found' });
      }
      return updated;
    });
    return toVisaResponse(row);
  }

  async function deleteVisa(employeeId: string, visaId: bigint): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await requireEmployeeLock(employeeId, tx);
      const count = await repositories.visas.deleteByEmployeeAndId(
        employeeId,
        visaId,
        tx,
      );
      if (count === 0) {
        throw new ServiceError(404, { error: 'visa not found' });
      }
    });
  }

  return {
    listVisas,
    getVisa,
    createVisa,
    requireEmployeeLock,
    updateVisa,
    deleteVisa,
  };
}
