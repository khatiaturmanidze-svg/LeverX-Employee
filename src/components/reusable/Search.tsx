import React, { useMemo } from "react";

interface SearchProps<TItem, TValue> {
  items: TItem[];
  value: TValue;
  onChange: (value: TValue) => void;
  filterFn: (item: TItem, value: TValue) => boolean;
  renderInput: (
    value: TValue,
    onChange: (value: TValue) => void,
  ) => React.ReactNode;
  children: (filteredItems: TItem[]) => React.ReactNode;
}

export default function Search<TItem, TValue>({
  items,
  value,
  onChange,
  filterFn,
  renderInput,
  children,
}: SearchProps<TItem, TValue>): React.ReactElement {
  const filteredItems = useMemo(
    () => items.filter((item) => filterFn(item, value)),
    [items, value, filterFn],
  );

  return (
    <>
      {renderInput(value, onChange)}
      {children(filteredItems)}
    </>
  );
}
