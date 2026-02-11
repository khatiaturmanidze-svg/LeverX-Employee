import React from "react";
import { IEmployee } from "../../types/type";
import { formatDateOfBirth } from "../../core.tsx";
import { DetailRow } from "./DetailRow.tsx";

interface EmployeeViewProps {
  user: IEmployee;
}

export function EmployeeView({ user }: EmployeeViewProps) {
  const formattedDOB = user.date_birth
    ? formatDateOfBirth(user.date_birth)
    : "no date of birth";
  const managerName = user.manager
    ? `${user.manager.first_name.concat(user.manager.last_name)}`
    : "no manager assigned";

  return (
    <div className="details-section">
      <h2 className="details-section__general">General Info</h2>
      <DetailRow
        icon="briefcase-icon"
        label="Department"
        value={user.department}
        isEditing={false}
        fieldName="department"
      />
      <DetailRow
        icon="building-icon"
        label="Building"
        value={user.building}
        isEditing={false}
        fieldName="building"
      />
      <DetailRow
        icon="door-icon"
        label="Room"
        value={user.room}
        isEditing={false}
        fieldName="room"
      />
      <DetailRow
        icon="hashtag-icon"
        label="Desk Number"
        value={user.desk_number?.toString()}
        isEditing={false}
        fieldName="desk_number"
      />
      <DetailRow
        icon="calendar-icon"
        label="Date Birth"
        value={formattedDOB}
        isEditing={false}
        fieldName="date_birth"
      />
      <DetailRow
        icon="user-icon"
        label="Manager"
        value={managerName}
        isEditing={false}
        fieldName="manager"
      />

      <h2 className="details-section__general">Contacts</h2>
      <DetailRow
        icon="mobile-icon"
        label="Phone"
        value={user.phone}
        isEditing={false}
        fieldName="phone"
      />
      <DetailRow
        icon="at-icon"
        label="Email"
        value={user.email}
        isEditing={false}
        fieldName="email"
      />
      <DetailRow
        icon="zoom-icon"
        label="Zoom ID"
        value={user.zoom_id}
        isEditing={false}
        fieldName="zoom_id"
      />
      <DetailRow
        icon="zoom-icon"
        label="Zoom Link"
        value={user.zoom_link}
        isEditing={false}
        fieldName="zoom_link"
      />

      <h2 className="details-section__general">Travel Info</h2>
      <DetailRow
        icon="globe-icon"
        label="Citizenship"
        value={user.citizenship}
        isEditing={false}
        fieldName="citizenship"
      />

      {user.visa && user.visa.length > 0 && (
        <>
          <h3 className="details-section__subheading">Visas</h3>
          {user.visa?.map((v, i) => {
            const startDate = v.start_date
              ? new Date(v.start_date).toLocaleDateString()
              : "";
            const endDate = v.end_date
              ? new Date(v.end_date).toLocaleDateString()
              : "";

            return (
              <div key={i} className="visa-row">
                <DetailRow
                  icon="globe-icon"
                  label="Issuing Country"
                  value={v.issuing_country}
                  isEditing={false}
                  fieldName={`visa_${i}_issuing_country`}
                />
                <DetailRow
                  icon="globe-icon"
                  label="Type"
                  value={v.type}
                  isEditing={false}
                  fieldName={`visa_${i}_type`}
                />
                <DetailRow
                  icon="calendar-icon"
                  label="Start Date"
                  value={startDate}
                  isEditing={false}
                  fieldName={`visa_${i}_start_date`}
                />
                <DetailRow
                  icon="calendar-icon"
                  label="End Date"
                  value={endDate}
                  isEditing={false}
                  fieldName={`visa_${i}_end_date`}
                />
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
