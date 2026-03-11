import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoggedInUser({ loggedInUser }) {
  const navigate = useNavigate();
  return (
    <div
      className="header__user"
      onClick={() => {
        if (loggedInUser) navigate(`/details/${loggedInUser._id}`);
      }}
    >
      {loggedInUser ? (
        <button
          className="flex--horizontal header__logged-in"
          data-id={loggedInUser._id}
        >
          <img
            src={loggedInUser.user_avatar}
            alt="employee"
            className="header__employee-img"
          />

          <p className="header__employee">
            {loggedInUser.first_name} {loggedInUser.last_name}
          </p>
        </button>
      ) : (
        <p className="header__employee">Not Logged In</p>
      )}
    </div>
  );
}
