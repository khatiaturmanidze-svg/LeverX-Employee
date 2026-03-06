import React from "react";
import RequestListItem from "./RequestListItem";
export default function RequestList(): React.ReactElement {
  return (
    <div className="request-list card">
      <p>My leave requests</p>
      <select>
        <option>All types of requests</option>
        <option>Sick leave</option>
        <option>Vacation</option>
        <option>Military leave</option>
      </select>

      <RequestListItem />
    </div>
  );
}
