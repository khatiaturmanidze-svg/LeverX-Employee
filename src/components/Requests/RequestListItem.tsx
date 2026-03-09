import React from "react";

export default function RequestListItem(): React.ReactElement {
  return (
    <div className="request-list__item">
      <div className="request-list__item-header">
        <span className="request-list__id">#12345</span>
        <span className="request-list__status">Active</span>
      </div>
      <div className="request-list__item-details">
        <div className="detail-group">
          <label>Type</label>
          <span>Vacation</span>
        </div>
        <div className="detail-group">
          <label>Period</label>
          <span>Oct 12 — Oct 20</span>
        </div>
        <div className="detail-group">
          <label>Approved by</label>
          <span className="approver">Anno Hideaki</span>
        </div>
      </div>
    </div>
  );
}
