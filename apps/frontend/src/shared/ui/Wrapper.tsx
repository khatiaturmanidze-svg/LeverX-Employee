import React from 'react';
import { IEmployee } from '../../types/type';
import LazyImage from './LazyImage';

interface WrapperProps {
  display: string;
  user: IEmployee;
}

export default function Wrapper({
  display,
  user,
}: WrapperProps): React.ReactElement {
  return (
    <div className="wrapper">
      <LazyImage
        src={user.user_avatar}
        alt={user.first_name}
        className={`employee-${display}__img`}
        skeletonClassName={`lazy-image--employee-${display}`}
      />

      {user.isRemoteWork ? (
        <div className="home-box">
          <img
            src="/svgs/home-icon.svg"
            alt="home icon"
            className={`home-box__${display}`}
          />
        </div>
      ) : (
        ''
      )}
    </div>
  );
}
