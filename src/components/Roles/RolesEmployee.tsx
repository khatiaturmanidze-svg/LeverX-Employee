import React from "react";
import { IEmployee } from "../../types/type";

interface RolesEmployeeProps {
  user: IEmployee;
  onRoleChange: (userId: string, newRole: string) => void;
  isAdmin: boolean;
}

export function RolesEmployee({
  user,
  onRoleChange,
  isAdmin,
}: RolesEmployeeProps) {
  const renderRoleButton = (roleName: string) => {
    const isActive = user.role === roleName;

    return (
      <button
        type="button"
        className={`section-roles__role-${roleName.toLowerCase()} ${
          isActive ? "role" : ""
        }`}
        onClick={() => onRoleChange(user._id, roleName)}
        disabled={isActive && isAdmin}
      >
        {roleName}
      </button>
    );
  };
  return (
    <>
      <div className="section-roles__employee">
        <img
          src={user.user_avatar}
          alt="employee img"
          className="section-roles__employee-img"
        />
        <p className="section-roles__employee-name">
          {user.first_name} {user.last_name}
        </p>
      </div>
      <div className="section-roles__role">
        {renderRoleButton("Employee")}
        {renderRoleButton("HR")}
      </div>

      <div className="section-roles__vacation-role"></div>

      <p
        className={`section-roles__role-admin ${
          user.role === "Admin" ? "role" : ""
        }`}
      >
        admin
      </p>
    </>
  );
}
