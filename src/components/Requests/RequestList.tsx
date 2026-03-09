import React, { useState } from "react";
import RequestListItem from "./RequestListItem";
import { useGetRequestsQuery } from "../../features/RequestsApi";
import { useParams } from "react-router-dom";
export default function RequestList(): React.ReactElement {
  const [requestType, setRequestType] = useState("");
  const { id } = useParams();

  const { data: requests = [] } = useGetRequestsQuery(id);

  const visibleRequests = requests.filter((req) => {
    if (requestType === "All types of requests" || requestType === "") {
      return true;
    }
    return req.type.toLowerCase() === requestType.toLowerCase();
  });

  return (
    <div className="request-list card">
      <div className="flex--horizontal ">
        <p className="request-list__header">My leave requests</p>
        <select
          className="request-list__select"
          onChange={(e) => setRequestType(e.target.value)}
        >
          <option>All types of requests</option>
          <option>Sick leave</option>
          <option>Vacation</option>
          <option>Military leave</option>
        </select>
      </div>

      {visibleRequests.length > 0 ? (
        visibleRequests.map((req) => (
          <RequestListItem key={req.id} request={req} />
        ))
      ) : (
        <div>
          <img
            src="/assets/nothing-found.jpg"
            alt="nothing found"
            className="request-form__img"
          />
          <p className="request-list__nothing">
            No {requestType} requests found
          </p>
        </div>
      )}
    </div>
  );
}
