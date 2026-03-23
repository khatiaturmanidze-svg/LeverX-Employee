// Server-side employee types.
// Keep these inside `server/` so `tsc` (with rootDir=server) can compile/check
// without pulling in frontend-only code.

export interface IDateOfBirth {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface IManager {
  id: string;
  first_name: string;
  last_name: string;
}

export interface IVisa {
  issuing_country: string;
  type: string;
  start_date: string;
  end_date: string;
}

export interface IRequestData {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  note: string;
  employeeId: string;

  status: 'approved' | 'pending' | 'rejected';
}

export interface IEmployee {
  _id: string;
  role: string;
  user_avatar: string;

  first_name: string;
  last_name: string;
  first_native_name?: string;
  middle_native_name?: string;
  last_native_name?: string;

  department: string;
  building: string;
  room: string;
  desk_number?: number | null;
  isRemoteWork: boolean;

  phone?: string;
  email: string;
  zoom_id?: string;
  zoom_link?: string;

  citizenship?: string;
  date_birth?: IDateOfBirth;
  manager?: IManager;
  visa?: IVisa[];

  requests: IRequestData[];
}
