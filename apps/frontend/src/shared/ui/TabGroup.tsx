import React from 'react';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

interface TabGroupProps {
  containerClassName?: string;
  tabBaseClassName: string;
  activeModifierClassName?: string;
  tabs: TabItem[];
}

export default function TabGroup({
  containerClassName,
  tabBaseClassName,
  activeModifierClassName,
  tabs,
}: TabGroupProps): React.ReactElement {
  return (
    <div className={containerClassName}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`${tabBaseClassName} ${
            tab.isActive && activeModifierClassName
              ? activeModifierClassName
              : ''
          } ${tab.className ?? ''}`}
          aria-pressed={tab.isActive}
          onClick={tab.onClick}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
