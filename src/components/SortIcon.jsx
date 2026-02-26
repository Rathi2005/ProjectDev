import { ChevronUp, ChevronDown } from "lucide-react";

export default function SortIcon({ columnKey, sortConfig }) {
  const isActive = sortConfig?.key === columnKey;

  return (
    <span className="ml-2 flex flex-col justify-center items-center">
      <ChevronUp
        className={`w-4 h-4 transition-all duration-200 ${
          isActive && sortConfig.direction === "asc"
            ? "text-indigo-400"
            : "text-gray-500 opacity-60"
        }`}
      />
      <ChevronDown
        className={`w-4 h-4 -mt-1 transition-all duration-200 ${
          isActive && sortConfig.direction === "desc"
            ? "text-indigo-400"
            : "text-gray-500 opacity-60"
        }`}
      />
    </span>
  );
}