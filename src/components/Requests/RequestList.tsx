import React from "react";
import RequestListItem from "./RequestListItem";
export default function RequestList(): React.ReactElement {
  return (
    <div className="request-list card">
      <div className="flex--horizontal ">
        <p className="request-list__header">My leave requests</p>
        <select className="request-list__select">
          <option>All types of requests</option>
          <option>Sick leave</option>
          <option>Vacation</option>
          <option>Military leave</option>
        </select>
      </div>
      <RequestListItem />
      <RequestListItem />
    </div>
  );
}
