import { Icon } from '@/shared';
import { getErrorMessage } from '@shared/lib';
import React, { useRef, useState } from 'react';
import type { UploadSpreadsheetError, UploadedUserResult } from '@/types/type';
import { useUploadSpreadsheetMutation } from '../api/createUserApi';

export default function CreateUserUpload(): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [importedUsers, setImportedUsers] = useState<UploadedUserResult[]>([]);
  const [skippedRows, setSkippedRows] = useState<UploadSpreadsheetError[]>([]);
  const [uploadSpreadsheet, { isLoading }] = useUploadSpreadsheetMutation();

  const uploadFile = async (file: File) => {
    if (!file) {
      return;
    }

    try {
      const result = await uploadSpreadsheet(file).unwrap();
      setImportedUsers(result.importedUsers);
      setSkippedRows(result.skippedRows);
      setStatusMessage(
        `Imported ${result.count} user${result.count === 1 ? '' : 's'}${result.skippedRows.length > 0 ? `, skipped ${result.skippedRows.length}` : ''}.`,
      );
    } catch (error) {
      setImportedUsers([]);
      setSkippedRows([]);
      setStatusMessage(getErrorMessage(error));
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      await uploadFile(file);
    }

    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      await uploadFile(file);
    }
  };

  return (
    <div
      className={`create-user-upload${isDragging ? ' create-user-upload--dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xls,.xlsx"
        hidden
        onChange={handleFileSelect}
      />
      <Icon
        src="/svgs/drag-icon.svg"
        alt="drag and drop icon"
        width={100}
        height={100}
      />
      <button
        type="button"
        className="create-user-upload__btn btn-submit"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
      >
        {isLoading ? 'Uploading...' : 'Upload a spreadsheet'}
      </button>

      {statusMessage && <p className="form-error">{statusMessage}</p>}
      {importedUsers.length > 0 && (
        <div className="create-user-upload__results">
          <h3 className="create-user-upload__results-title">Imported Users</h3>
          <ul className="create-user-upload__results-list">
            {importedUsers.map((user) => (
              <li
                key={user.employeeId}
                className="create-user-upload__results-item"
              >
                <span>{user.email}</span>
                <span>Temporary password: {user.temporaryPassword}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {skippedRows.length > 0 && (
        <div className="create-user-upload__results">
          <h3 className="create-user-upload__results-title">Skipped Rows</h3>
          <ul className="create-user-upload__results-list">
            {skippedRows.map((row) => (
              <li
                key={`${row.row}-${row.email}`}
                className="create-user-upload__results-item"
              >
                <span>Row {row.row}</span>
                <span>{row.email || 'No email provided'}</span>
                <span>{row.error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
