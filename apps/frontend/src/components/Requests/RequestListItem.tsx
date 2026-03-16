import React from 'react';
import { IRequestData } from '../../types/type';
import { getDisplayStatus } from '../../utils/core';
import { useUpdateRequestMutation } from '../../features/RequestsApi';
import { useGetManager } from '../../utils/customHooks';

interface RequestListItemProps {
  request: IRequestData;
  isPersonal: boolean;
}

const RequestListItem: React.FC<RequestListItemProps> = ({
  request,
  isPersonal,
}) => {
  const [updateRequest, { isLoading }] = useUpdateRequestMutation();
  const approveRequest = async () => {
    try {
      await updateRequest({
        employeeId: request.employeeId,
        requestId: request.id,
        newStatus: 'approved',
      }).unwrap();
    } catch (error) {
      console.error('Approve failed:', error);
    }
  };
  const rejectRequest = async () => {
    try {
      await updateRequest({
        employeeId: request.employeeId,
        requestId: request.id,
        newStatus: 'rejected',
      }).unwrap();
    } catch (error) {
      console.error('Reject failed:', error);
    }
  };

  const manager = useGetManager(request.employeeId);

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
        {isPersonal === true ? (
          <div className="detail-group">
            <label>
              {request.status === 'approved'
                ? 'Approved by'
                : request.status === 'rejected'
                  ? 'Rejected by'
                  : 'Awaiting for approval'}
            </label>
            <span className="approver">
              {manager?.first_name} {manager?.last_name}
            </span>
          </div>
        ) : (
          <div className="flex--horizontal">
            <button
              onClick={approveRequest}
              disabled={isLoading || request.status !== 'pending'}
              className="request-btn__approve"
            >
              {isLoading ? '...' : 'approve'}
            </button>
            <button
              onClick={rejectRequest}
              disabled={isLoading || request.status !== 'pending'}
              className="request-btn__reject"
            >
              reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestListItem;
