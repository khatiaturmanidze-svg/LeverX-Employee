import { IEmployee } from '../../types/type';
import React from 'react';
import Icon from './Icon';
import LazyImage from './LazyImage';

interface AvatarSectionProps {
  user: IEmployee;
  canEdit: boolean;
  onEditClick: () => void;
  onCopyLink: () => void | Promise<void>;
  copyLinkMessage?: string;
}

export default function AvatarSection({
  user,
  canEdit,
  onEditClick,
  onCopyLink,
  copyLinkMessage,
}: AvatarSectionProps) {
  const isRemoteWork = user.isRemoteWork ? (
    <div className="home-box">
      <Icon
        src="/svgs/home-icon.svg"
        alt="home icon"
        className="home-box__icon"
        width={16}
        height={16}
      />
    </div>
  ) : null;

  const editButton = canEdit ? (
    <button className="avatar-section__edit" onClick={onEditClick}>
      <div className="flex--horizontal">
        <Icon
          src="/svgs/edit-icon.svg"
          alt="edit icon"
          className="avatar-section__edit-icon icon"
          width={16}
          height={16}
        />
        <p>edit</p>
      </div>
    </button>
  ) : null;

  return (
    <div className="avatar-section">
      <div className="wrapper">
        <LazyImage
          src={user.user_avatar}
          alt="employee"
          className="avatar-section__img"
          skeletonClassName="lazy-image--avatar"
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
        <Icon
          src="/svgs/link-icon.svg"
          alt="copy link icon"
          className="avatar-section__link"
          width={16}
          height={16}
        />
        <p>Copy link</p>
      </button>
      {copyLinkMessage && <p className="form-success">{copyLinkMessage}</p>}
    </div>
  );
}
