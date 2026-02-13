import React from "react";
import { IEmployee } from "../../types/type";
import BtnRole from "./BtnRole";

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
        <BtnRole
          roleName="Employee"
          user={user}
          onRoleChange={onRoleChange}
          isAdmin={isAdmin}
        />
        <BtnRole
          roleName="HR"
          user={user}
          onRoleChange={onRoleChange}
          isAdmin={isAdmin}
        />
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
