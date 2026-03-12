// For date of birth
export interface IDateOfBirth {
  year: number | null;
  month: number | null;
  day: number | null;
}

// Manager info
export interface IManager {
  id: string;
  first_name: string;
  last_name: string;
}

// Visa info
export interface IVisa {
  issuing_country: string;
  type: string;
  start_date: string; // timestamp
  end_date: string; // timestamp
}

// Employee interface
export interface IEmployee {
  // ID and avatar
  _id: string;
  role: string;
  user_avatar: string;

  // Names
  first_name: string;
  last_name: string;
  first_native_name?: string;
  middle_native_name?: string;
  last_native_name?: string;

  // Job and location
  department: string;
  building: string;
  room: string;
  desk_number?: number | null;
  isRemoteWork: boolean;

  // Contacts
  phone?: string;
  email: string;
  zoom_id?: string;
  zoom_link?: string;

  // Travel info
  citizenship?: string;
  date_birth?: IDateOfBirth;
  manager?: IManager;
  visa?: IVisa[];

  requests?: IRequestData[];
}

export type EmployeeUpdate = Partial<Omit<IEmployee, 'manager'>> & {
  manager?: string | null;
};

export interface IRequestData {
  id: string;
  type: string;
  start_date: string;
  employeeId: string;
  end_date: string;
  note: string;

  status: 'approved' | 'pending' | 'rejected';
  // need to add approver (manager of logged in user)
}

export type RequestUpdate = Partial<Omit<IRequestData, 'id'>> & {
  manager?: string | null;
};
