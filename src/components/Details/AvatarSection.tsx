import { IEmployee } from '../../types/type';
import React from 'react';

interface AvatarSectionProps {
  user: IEmployee;
  canEdit: boolean;
  onEditClick: () => void;
  onCopyLink: () => void;
}

export default function AvatarSection({
  user,
  canEdit,
  onEditClick,
  onCopyLink,
}: AvatarSectionProps) {
  const isRemoteWork = user.isRemoteWork ? (
    <div className="home-box">
      <img
        src="/svgs/home-icon.svg"
        alt="home icon"
        className="home-box__icon"
      />
    </div>
  ) : null;

  const editButton = canEdit ? (
    <button className="avatar-section__edit" onClick={onEditClick}>
      <div className="flex--horizontal">
        <img
          src="/svgs/edit-icon.svg"
          alt="edit icon"
          className="avatar-section__edit-icon icon"
        />
        <p>edit</p>
      </div>
    </button>
  ) : null;

  return (
    <div className="avatar-section">
      <div className="wrapper">
        <img
          src={user.user_avatar}
          alt="employee"
          className="avatar-section__img"
        />
        {isRemoteWork}
      </div>
      <h3 className="avatar-section__full">
        {user.first_name} {user.last_name}
      </h3>
      <p className="avatar-section__native">
        {user.first_native_name} {user.middle_native_name}{' '}
        {user.last_native_name}
      </p>

      {editButton}
      <button
        className="flex--horizontal avatar-section__copy"
        onClick={onCopyLink}
      >
        <img src="/svgs/link-icon.svg" className="avatar-section__link" />
        <p>Copy link</p>
      </button>
    </div>
  );
}
