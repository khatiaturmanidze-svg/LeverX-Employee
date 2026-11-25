import { Prisma, type PrismaClient } from '../generated/prisma/client.js';
import type { IEmployee } from '../employeeTypes.js';
import { employeeRelations } from '../repositories/employeeRepository.js';
import {
  toEmployeeData,
  toEmployeeResponse,
} from '../mappers/employeeMapper.js';
import { ServiceError } from './serviceError.js';

type ProfileInput = Pick<IEmployee, 'first_name' | 'last_name' | 'email'> &
  Partial<IEmployee>;

export function makeProfile(input: ProfileInput, id: string): IEmployee {
  if (
    !input.first_name?.trim() ||
    !input.last_name?.trim() ||
    !input.email?.trim()
  ) {
    throw new ServiceError(400, { error: 'name and email are required' });
  }
  return {
    _id: id,
    email: input.email.trim().toLowerCase(),
    first_name: input.first_name,
    last_name: input.last_name,
    role: input.role ?? 'Employee',
    user_avatar: input.user_avatar ?? '/users/dumplinh.jpg',
    first_native_name: input.first_native_name ?? '',
    middle_native_name: input.middle_native_name ?? '',
    last_native_name: input.last_native_name ?? '',
    department: input.department ?? '',
    building: input.building ?? '',
    room: input.room ?? '0',
    desk_number: input.desk_number ?? null,
    isRemoteWork: input.isRemoteWork ?? false,
    phone: input.phone ?? '',
    zoom_id: input.zoom_id ?? '',
    zoom_link: input.zoom_link ?? '',
    citizenship: input.citizenship ?? '',
    date_birth: input.date_birth ?? { year: null, month: null, day: null },
    manager: input.manager ?? { id: '', first_name: '', last_name: '' },
    visa: input.visa ?? [],
    requests: [],
  };
}

export function isEmailConflict(error: unknown): boolean {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== 'P2002'
  ) {
    return false;
  }
  const target = error.meta?.target;
  if (Array.isArray(target) && target.includes('email')) return true;

  const adapterError = error.meta?.driverAdapterError as
    | {
        cause?: { constraint?: { index?: string } };
      }
    | undefined;
  const index = adapterError?.cause?.constraint?.index;
  return (
    index === 'employees_email_key' ||
    index === 'auth_users_email_key' ||
    index === 'employees_email_normalized_key' ||
    index === 'auth_users_email_normalized_key'
  );
}

export async function createAccount(
  prisma: PrismaClient,
  profile: IEmployee,
  hash: string,
  mustChangePassword: boolean,
): Promise<IEmployee> {
  return prisma.$transaction(async (tx) => {
    const position = await tx.employee.aggregate({
      _max: { sourcePosition: true },
    });
    const employee = await tx.employee.create({
      data: {
        ...toEmployeeData(profile),
        sourcePosition: (position._max.sourcePosition ?? -1) + 1,
        authUser: {
          create: {
            email: profile.email,
            hashedPassword: hash,
            mustChangePassword,
          },
        },
        visas: {
          create: (profile.visa ?? []).map((visa, sourcePosition) => ({
            issuingCountry: visa.issuing_country,
            type: visa.type,
            startDateMs: BigInt(visa.start_date),
            endDateMs: BigInt(visa.end_date),
            sourcePosition,
          })),
        },
      },
      include: employeeRelations,
    });
    return toEmployeeResponse(employee);
  });
}
