import { useState, useMemo } from "react";

export default function useSortableData(items, defaultConfig = null) {
  const [sortConfig, setSortConfig] = useState(defaultConfig);

  const sortedItems = useMemo(() => {
    if (!sortConfig?.key) return items;

    const sortableItems = [...items];

    sortableItems.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Date sorting
      if (sortConfig.key.toLowerCase().includes("at")) {
        return sortConfig.direction === "asc"
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      }

      // Number sorting
      if (typeof aValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      // String sorting
      return sortConfig.direction === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";

    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  return { sortedItems, requestSort, sortConfig };
}