import React, { useState } from 'react';
import { IEmployee } from '../../types/type';

interface EmployeeHeaderProps {
  users: IEmployee[];
  onViewChange: (mode: 'grid' | 'list') => void;
}

export default function EmployeeHeader({
  users,
  onViewChange,
}: EmployeeHeaderProps): React.ReactElement {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleViewToggle = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    onViewChange(mode);
  };
  const isGrid = viewMode === 'grid';
  const employeeCount = users.length;

  return (
    <>
      <div className="flex-right">
        <p className="employee-displayed">
          {employeeCount} employees displayed
        </p>
        <div className="flex--horizontal">
          <button
            className={`view-toggle__icon-grid ${isGrid ? 'clicked' : ''} `}
            onClick={() => handleViewToggle('grid')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <rect
                x="48"
                y="48"
                width="176"
                height="176"
                rx="20"
                ry="20"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="32"
              />
              <rect
                x="288"
                y="48"
                width="176"
                height="176"
                rx="20"
                ry="20"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="32"
              />
              <rect
                x="48"
                y="288"
                width="176"
                height="176"
                rx="20"
                ry="20"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="32"
              />
              <rect
                x="288"
                y="288"
                width="176"
                height="176"
                rx="20"
                ry="20"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="32"
              />
            </svg>
          </button>

          <button
            className={`view-toggle__icon-menu ${isGrid ? '' : 'clicked'} `}
            onClick={() => handleViewToggle('list')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeMiterlimit="10"
                strokeWidth="32"
                d="M80 160h352M80 256h352M80 352h352"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
