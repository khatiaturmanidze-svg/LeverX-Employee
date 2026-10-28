import type { Prisma, PrismaClient } from '../generated/prisma/client.js';
import type { IEmployee } from '../employeeTypes.js';
import { isEmailConflict } from './accountCreation.js';
import { ServiceError } from './serviceError.js';

export type ProfilePatch = Partial<
  Omit<IEmployee, '_id' | 'manager' | 'role' | 'requests'>
> & { manager?: string | null };

const editableFields = new Set([
  'first_name',
  'last_name',
  'user_avatar',
  'first_native_name',
  'middle_native_name',
  'last_native_name',
  'department',
  'building',
  'room',
  'desk_number',
  'isRemoteWork',
  'phone',
  'email',
  'zoom_id',
  'zoom_link',
  'citizenship',
  'manager',
  'date_birth',
  'visa',
]);

export async function updateEmployeeProfile(
  prisma: PrismaClient,
  id: string,
  patch: ProfilePatch,
  readEmployee: (id: string) => Promise<IEmployee>,
) {
  if (Object.keys(patch).some((key) => !editableFields.has(key))) {
    throw new ServiceError(400, { error: 'unsupported employee field' });
  }
  const email = patch.email?.trim().toLowerCase();
  if (patch.email !== undefined && !email) {
    throw new ServiceError(400, { error: 'email is required' });
  }

  const data: Prisma.EmployeeUncheckedUpdateInput = {
    firstName: patch.first_name,
    lastName: patch.last_name,
    userAvatar: patch.user_avatar,
    firstNativeName: patch.first_native_name,
    middleNativeName: patch.middle_native_name,
    lastNativeName: patch.last_native_name,
    department: patch.department,
    building: patch.building,
    room: patch.room,
    deskNumber: patch.desk_number,
    isRemoteWork: patch.isRemoteWork,
    phone: patch.phone,
    email,
    zoomId: patch.zoom_id,
    zoomLink: patch.zoom_link,
    citizenship: patch.citizenship,
    managerId: patch.manager === undefined ? undefined : patch.manager || null,
    birthYear:
      patch.date_birth === undefined
        ? undefined
        : (patch.date_birth?.year ?? null),
    birthMonth:
      patch.date_birth === undefined
        ? undefined
        : (patch.date_birth?.month ?? null),
    birthDay:
      patch.date_birth === undefined
        ? undefined
        : (patch.date_birth?.day ?? null),
  };

  try {
    await prisma.$transaction(async (tx) => {
      // Prisma has no findUnique option for row locks. Keep related edits serialized.
      const found = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM employees WHERE id = ${id} FOR UPDATE
      `;
      if (!found.length) {
        throw new ServiceError(404, { error: 'employee not found' });
      }
      await tx.employee.update({ where: { id }, data });
      if (email !== undefined) {
        await tx.authUser.updateMany({
          where: { employeeId: id },
          data: { email },
        });
      }
      if (patch.visa !== undefined) {
        await tx.visa.deleteMany({ where: { employeeId: id } });
        if (patch.visa.length) {
          await tx.visa.createMany({
            data: patch.visa.map((visa, sourcePosition) => ({
              employeeId: id,
              issuingCountry: visa.issuing_country,
              type: visa.type,
              startDateMs: BigInt(visa.start_date),
              endDateMs: BigInt(visa.end_date),
              sourcePosition,
            })),
          });
        }
      }
    });
  } catch (error) {
    if (isEmailConflict(error)) {
      throw new ServiceError(400, { error: 'email already exists' });
    }
    throw error;
  }
  return {
    message: 'employee updated successfully',
    employee: await readEmployee(id),
  };
}
