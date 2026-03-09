import React from "react";
import { IRequestData } from "../../types/type";
import { getDisplayStatus } from "../../utils/core";

interface RequestListItemProps {
  request: IRequestData;
}

export default function RequestListItem({
  request,
}: RequestListItemProps): React.ReactElement {
  return (
    <div className="request-list__item">
      <div className="request-list__item-header">
        <span className="request-list__id">{request.id}</span>
        <span className={`status-pill status--${request.status}`}>
          {getDisplayStatus(request)}
        </span>
      </div>
      <div className="request-list__item-details">
        <div className="detail-group">
          <label>Type</label>
          <span>{request.type}</span>
        </div>
        <div className="detail-group">
          <label>Period</label>
          <span>
            {request.start_date} — {request.end_date}
          </span>
        </div>
        <div className="detail-group">
          <label>Approved by</label>
          <span className="approver">Anno Hideaki</span>
        </div>
      </div>
    </div>
  );
}
