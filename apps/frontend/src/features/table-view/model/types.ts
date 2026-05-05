import type {
  EditableEmployeeField,
  EmployeeDraft,
  IEmployee,
} from '@/types/type';

export interface EmployeeRowData {
  users: IEmployee[];
  onViewDetails?: (userId: string) => void;
  editingUserId: string | null;
  drafts: Record<string, EmployeeDraft>;
  rowErrors: Record<string, string>;
  isSaving: boolean;
  onStartEdit: (user: IEmployee) => void;
  onCancelEdit: (userId: string) => void;
  onDraftChange: (
    userId: string,
    field: EditableEmployeeField,
    value: string,
  ) => void;
  onSave: (user: IEmployee) => void;
}
