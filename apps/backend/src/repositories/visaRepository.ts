import type { Prisma, PrismaClient } from '../generated/prisma/client.js';
import type { VisaListQuery } from '../visaTypes.js';
import { toVisaResponse } from '../mappers/visaMapper.js';
import type { CreateVisaInput } from '../visaTypes.js';
import { toStoredDate } from '../mappers/visaMapper.js';

export function createVisaRepository(prisma: PrismaClient) {
  async function listByEmployeeId(employeeId: string) {
    const rows = await prisma.visa.findMany({
      where: { employeeId },
      orderBy: [{ sourcePosition: 'asc' }, { id: 'asc' }],
    });
    return rows.map(toVisaResponse);
  }

  function findByEmployeeAndId(
    employeeId: string,
    visaId: bigint,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.visa.findFirst({ where: { id: visaId, employeeId } });
  }

  async function listPageByEmployeeId(
    employeeId: string,
    query: VisaListQuery,
  ) {
    const where: Prisma.VisaWhereInput = {
      employeeId,
      ...(query.issuing_country
        ? {
            issuing_country: {
              equals: query.issuing_country,
              mode: 'insensitive',
            },
          }
        : {}),
    };
    const [rows, total] = await prisma.$transaction(
      [
        prisma.visa.findMany({
          where,
          orderBy: [{ sourcePosition: 'asc' }, { id: 'asc' }],
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        prisma.visa.count({ where }),
      ],
      { isolationLevel: 'RepeatableRead' },
    );
    return { rows, total };
  }

  async function lockEmployee(
    employeeId: string,
    db: Prisma.TransactionClient,
  ) {
    const rows = await db.$queryRaw<{ id: string }[]>`
    SELECT id FROM employees WHERE id = ${employeeId} FOR UPDATE
  `;
    return rows.length > 0;
  }

  async function createForEmployee(
    employeeId: string,
    input: CreateVisaInput,
    db: Prisma.TransactionClient,
  ) {
    const position = await db.visa.aggregate({
      where: { employeeId },
      _max: { sourcePosition: true },
    });
    return db.visa.create({
      data: {
        employeeId,
        issuing_country: input.issuing_country,
        type: input.type,
        start_date: toStoredDate(input.start_date),
        end_date: toStoredDate(input.end_date),
        sourcePosition: (position._max.sourcePosition ?? -1) + 1,
      },
    });
  }

  async function updateByEmployeeAndId(
    employeeId: string,
    visaId: bigint,
    data: Prisma.VisaUpdateManyMutationInput,
    db: Prisma.TransactionClient,
  ) {
    const [row] = await db.visa.updateManyAndReturn({
      where: { id: visaId, employeeId },
      data,
    });
    return row ?? null;
  }

  async function deleteByEmployeeAndId(
    employeeId: string,
    visaId: bigint,
    db: Prisma.TransactionClient,
  ) {
    const result = await db.visa.deleteMany({
      where: { id: visaId, employeeId },
    });
    return result.count;
  }

  return {
    listByEmployeeId,
    findByEmployeeAndId,
    listPageByEmployeeId,
    lockEmployee,
    createForEmployee,
    updateByEmployeeAndId,
    deleteByEmployeeAndId,
  };
}
