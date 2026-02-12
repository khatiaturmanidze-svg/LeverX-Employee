import React from "react";

export default function ListHeader() {
  return (
    <div className="first-row">
      <div className="flex--horizontal">
        <img src="/svgs/circle-icon.svg" alt="photo icon" className="icon" />
        <p>Photo</p>
      </div>

      <div className="flex--horizontal">
        <img src="/svgs/user-icon.svg" alt="user icon" className="icon" />
        <p>Name</p>
      </div>

      <div className="flex--horizontal">
        <img
          src="/svgs/briefcase-icon.svg"
          alt="department icon"
          className="icon"
        />
        <p>Department</p>
      </div>

      <div className="flex--horizontal">
        <img src="/svgs/door-icon.svg" alt="room icon" className="icon" />
        <p>Room</p>
      </div>
    </div>
  );
}
