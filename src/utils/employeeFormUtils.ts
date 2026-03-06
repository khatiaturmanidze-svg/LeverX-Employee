import { IEmployee, IVisa } from "../types/type";

export const getEmployeeFormState = (user: IEmployee) => ({
  department: user.department,
  building: user.building,
  room: user.room,
  desk_number: user.desk_number?.toString() || "",
  phone: user.phone,
  email: user.email,
  zoom_id: user.zoom_id,
  zoom_link: user.zoom_link,
  citizenship: user.citizenship,

  first_native_name: user.first_native_name || "",
  last_native_name: user.last_native_name || "",
  date_birth: user.date_birth
    ? `${user.date_birth.year}-${String(user.date_birth.month).padStart(
        2,
        "0",
      )}-${String(user.date_birth.day).padStart(2, "0")}`
    : "",
  manager_id: user.manager?._id || "",

  visas:
    user.visa?.map((v) => ({
      issuing_country: v.issuing_country,
      type: v.type,
      start_date: v.start_date
        ? new Date(v.start_date).toISOString().slice(0, 10)
        : "",
      end_date: v.end_date
        ? new Date(v.end_date).toISOString().slice(0, 10)
        : "",
    })) || [],
});

export type EmployeeFormState = ReturnType<typeof getEmployeeFormState> & {
  visas: IVisa[];
};

export const validateEmployeeForm = (formData: EmployeeFormState) => {
  const errors: Record<string, string> = {};

  if (!formData.department) errors.department = "Department is required";
  if (!formData.email) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email";
  if (formData.desk_number && isNaN(Number(formData.desk_number)))
    errors.desk_number = "Desk number must be a number";

  if (formData.date_birth) {
    const [y, m, d] = formData.date_birth.split("-").map(Number);
    if (!y || y < 1900 || !m || m < 1 || m > 12 || !d || d < 1 || d > 31)
      errors.date_birth = "input format should be year-month-day";
  }

  // visas
  formData.visas.forEach((v, i) => {
    if (!v.issuing_country) errors[`visa_${i}_country`] = "Required";
    if (!v.type) errors[`visa_${i}_type`] = "Required";
  });

  return errors;
};
