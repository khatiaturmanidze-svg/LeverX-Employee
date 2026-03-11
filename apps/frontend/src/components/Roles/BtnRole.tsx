import React from 'react';
import { IEmployee } from '../../types/type';
interface BtnRoleProps {
  roleName: string;
  user: IEmployee;
  onRoleChange: (targetUser: string, newRole: string) => void;
  isAdmin: boolean;
}

export default function BtnRole({
  roleName,
  user,
  onRoleChange,
  isAdmin,
}: BtnRoleProps) {
  const isActive = user.role === roleName;

  return (
    <button
      type="button"
      className={`section-roles__role-${roleName.toLowerCase()} ${
        isActive ? 'role' : ''
      }`}
      onClick={() => onRoleChange(user._id, roleName)}
      disabled={isActive && isAdmin}
    >
      {roleName}
    </button>
  );
}
