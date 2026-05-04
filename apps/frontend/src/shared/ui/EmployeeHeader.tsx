import React, { useState } from 'react';
import { IEmployee } from '../../types/type';
import { Icon, TabGroup } from '@shared/ui';

interface EmployeeHeaderProps {
  users: IEmployee[];
  onViewChange: (mode: 'grid' | 'list' | 'table') => void;
}

export default function EmployeeHeader({
  users,
  onViewChange,
}: EmployeeHeaderProps): React.ReactElement {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');

  const handleViewToggle = (mode: 'grid' | 'list' | 'table') => {
    setViewMode(mode);
    onViewChange(mode);
  };
  const isGrid = viewMode === 'grid';
  const isList = viewMode === 'list';
  const employeeCount = users.length;

  return (
    <>
      <div className="flex-right">
        <p className="employee-displayed">
          {employeeCount} employees displayed
        </p>
        <div className="flex--horizontal">
          <TabGroup
            containerClassName=""
            tabBaseClassName=""
            activeModifierClassName="clicked"
            tabs={[
              {
                id: 'grid',
                isActive: isGrid,
                onClick: () => handleViewToggle('grid'),
                className: 'view-toggle__icon-grid',
                label: (
                  <Icon
                    src={`${isGrid ? '/svgs/grid_view-active.svg' : '/svgs/grid_view.svg'}`}
                    alt="Grid View"
                    className="view-toggle__icon-grid"
                    width={24}
                    height={24}
                  />
                ),
              },
              {
                id: 'list',
                isActive: isList,
                onClick: () => handleViewToggle('list'),
                className: 'view-toggle__icon-menu',
                label: (
                  <Icon
                    src={`${isList ? '/svgs/menu_view-active.svg' : '/svgs/menu_view.svg'}`}
                    alt="List View"
                    className="view-toggle__icon-menu"
                    width={24}
                    height={24}
                  />
                ),
              },

              {
                id: 'table',
                isActive: !isGrid && !isList,
                onClick: () => handleViewToggle('table'),
                className: 'view-toggle__icon-table',
                label: (
                  <Icon
                    src={`${!isGrid && !isList ? '/svgs/table_view-active.svg' : '/svgs/table_view.svg'}`}
                    alt="Table View"
                    className="view-toggle__icon-table"
                    width={24}
                    height={24}
                  />
                ),
              },
            ]}
          />
        </div>
      </div>
    </>
  );
}
