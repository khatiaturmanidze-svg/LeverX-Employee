import xlsx from 'xlsx';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import type { Pool } from 'pg';
import type {
  SpreadsheetRow,
  UploadSpreadsheetResponse,
} from '../serverTypes.js';
import {
  getCellString,
  createEmployeeFromSpreadsheetRow,
} from './spreadsheet.js';
import { generateTemporaryPassword } from './password.js';
import { createAccount, isEmailConflict } from './accountCreation.js';
import { ServiceError } from './serviceError.js';

export async function uploadSpreadsheetSql(
  pool: Pool,
  buffer: Buffer,
): Promise<UploadSpreadsheetResponse> {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const name = workbook.SheetNames[0];
  if (!name) throw new ServiceError(400, { error: 'spreadsheet is empty' });
  const rows = xlsx.utils.sheet_to_json<SpreadsheetRow>(workbook.Sheets[name], {
    defval: null,
  });
  const importedUsers: UploadSpreadsheetResponse['importedUsers'] = [];
  const skippedRows: UploadSpreadsheetResponse['skippedRows'] = [];
  const seen = new Set<string>();

  for (const [index, row] of rows.entries()) {
    const email = getCellString(row.email).toLowerCase();
    const skip = (error: string) =>
      skippedRows.push({ row: index + 2, email, error });
    if (
      [
        'first_name',
        'last_name',
        'email',
        'department',
        'building',
        'room',
      ].some((field) => !getCellString(row[field]))
    ) {
      skip('missing required fields');
      continue;
    }
    if (seen.has(email)) {
      skip('email already exists');
      continue;
    }
    const profile = createEmployeeFromSpreadsheetRow(row, uuidv4());
    const temporaryPassword = generateTemporaryPassword();
    const hash = await bcrypt.hash(
      temporaryPassword,
      Number(process.env.BCRYPT_SALT_ROUNDS) || 13,
    );
    try {
      await createAccount(pool, profile, hash, true);
      seen.add(email);
      importedUsers.push({ email, temporaryPassword, employeeId: profile._id });
    } catch (error) {
      if (isEmailConflict(error)) {
        skip('email already exists');
        continue;
      }
      // Previous per-account transactions have committed; report that honestly.
      skip('Import stopped because a database operation failed');
      return {
        message:
          'Import stopped; completed rows were saved. Retry the remaining rows.',
        count: importedUsers.length,
        importedUsers,
        skippedRows,
      };
    }
  }
  return {
    message: 'spreadsheet imported successfully',
    count: importedUsers.length,
    importedUsers,
    skippedRows,
  };
}
