"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./utils";

/* ── Types ── */
export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface CalendarProps {
  className?: string;
  mode?: "range";
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  numberOfMonths?: number;
  disabled?: { before?: Date };
}

/* ── Helpers ── */
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBeforeDay(a: Date, b: Date) {
  const ac = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bc = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return ac.getTime() < bc.getTime();
}

function isBetween(date: Date, start: Date, end: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return d > s && d < e;
}

function isToday(date: Date) {
  return isSameDay(date, new Date());
}

/* ── Single Month Grid ── */
interface MonthGridProps {
  year: number;
  month: number;
  selected?: DateRange;
  hoverDate: Date | null;
  onDayClick: (date: Date) => void;
  onDayHover: (date: Date) => void;
  onDayLeave: () => void;
  disabledBefore?: Date;
}

function MonthGrid({
  year,
  month,
  selected,
  hoverDate,
  onDayClick,
  onDayHover,
  onDayLeave,
  disabledBefore,
}: MonthGridProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  // Build day cells
  const cells: React.ReactNode[] = [];

  // Leading blanks
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`blank-${i}`} className="h-9" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const disabled = disabledBefore && isBeforeDay(date, disabledBefore);

    // Determine visual state
    const from = selected?.from;
    const to = selected?.to;

    const isStart = from ? isSameDay(date, from) : false;
    const isEnd = to ? isSameDay(date, to) : false;
    const isSelected = isStart || isEnd;

    // Compute effective range bounds (committed or hover-preview)
    let rangeFrom = from;
    let rangeTo = to;
    if (from && !to && hoverDate && !isSameDay(hoverDate, from)) {
      if (isBeforeDay(hoverDate, from)) {
        rangeFrom = hoverDate;
        rangeTo = from;
      } else {
        rangeTo = hoverDate;
      }
    }

    const isInRange = rangeFrom && rangeTo ? isBetween(date, rangeFrom, rangeTo) : false;
    const isRangeStart = rangeFrom && isSameDay(date, rangeFrom);
    const isRangeEnd = rangeTo && isSameDay(date, rangeTo);
    const hasRange = !!(rangeFrom && rangeTo);

    const todayFlag = isToday(date);

    // Compute background strip styles for range visualization
    let stripClass = "";
    if (hasRange) {
      if (isInRange) {
        stripClass = "bg-indigo-50";
      } else if (isRangeStart) {
        stripClass = "bg-gradient-to-r from-transparent via-indigo-50/50 to-indigo-50";
      } else if (isRangeEnd) {
        stripClass = "bg-gradient-to-l from-transparent via-indigo-50/50 to-indigo-50";
      }
    }

    cells.push(
      <div
        key={day}
        className={cn(
          "relative flex items-center justify-center h-10",
          stripClass,
        )}
      >
        <button
          type="button"
          disabled={!!disabled}
          onClick={() => !disabled && onDayClick(date)}
          onMouseEnter={() => !disabled && onDayHover(date)}
          onMouseLeave={onDayLeave}
          className={cn(
            "relative z-10 flex items-center justify-center w-9 h-9 rounded-full text-sm transition-all duration-150 cursor-pointer",
            // Default state
            !isSelected && !disabled && "hover:bg-indigo-100 text-gray-700",
            // Today
            todayFlag && !isSelected && "font-bold text-indigo-600 ring-1 ring-indigo-300",
            // Selected endpoints (committed)
            isSelected &&
              "bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold shadow-md shadow-indigo-200",
            // Hover preview endpoint (not yet committed)
            !isSelected && from && !to && hoverDate && isSameDay(date, hoverDate) &&
              "bg-indigo-200 text-indigo-800 font-medium",
            // In-range days
            isInRange && !isSelected && "text-indigo-700 font-medium",
            // Disabled
            disabled && "text-gray-300 cursor-not-allowed hover:bg-transparent",
          )}
        >
          {day}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="flex items-center justify-center h-9 text-xs font-semibold text-gray-400 uppercase tracking-wider select-none"
          >
            {d}
          </div>
        ))}
      </div>
      {/* Days grid */}
      <div className="grid grid-cols-7">
        {cells}
      </div>
    </div>
  );
}

/* ── Calendar Component ── */
function Calendar({
  className,
  selected,
  onSelect,
  numberOfMonths = 2,
  disabled,
}: CalendarProps) {
  const today = new Date();
  const [baseMonth, setBaseMonth] = React.useState(today.getMonth());
  const [baseYear, setBaseYear] = React.useState(today.getFullYear());
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);

  // Navigate months
  const prevMonth = () => {
    if (baseMonth === 0) {
      setBaseMonth(11);
      setBaseYear((y) => y - 1);
    } else {
      setBaseMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (baseMonth === 11) {
      setBaseMonth(0);
      setBaseYear((y) => y + 1);
    } else {
      setBaseMonth((m) => m + 1);
    }
  };

  // Click handler for range selection
  const handleDayClick = (date: Date) => {
    if (!onSelect) return;

    const from = selected?.from;
    const to = selected?.to;

    if (!from || (from && to)) {
      // Start fresh selection
      onSelect({ from: date, to: undefined });
    } else {
      // We have a start, pick end
      if (isBeforeDay(date, from)) {
        // Clicked before start → swap
        onSelect({ from: date, to: from });
      } else if (isSameDay(date, from)) {
        // Clicked same day → deselect
        onSelect(undefined);
      } else {
        onSelect({ from, to: date });
      }
    }
  };

  // Build month panels
  const months: { year: number; month: number }[] = [];
  for (let i = 0; i < numberOfMonths; i++) {
    let m = baseMonth + i;
    let y = baseYear;
    if (m > 11) {
      m -= 12;
      y += 1;
    }
    months.push({ year: y, month: m });
  }

  return (
    <div
      className={cn(
        "p-5 select-none",
        className,
      )}
    >
      {/* Navigation header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          type="button"
          onClick={prevMonth}
          className="flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-8">
          {months.map(({ year, month }) => (
            <span
              key={`${year}-${month}`}
              className="text-sm font-semibold text-gray-800 min-w-[140px] text-center"
            >
              {MONTHS[month]} {year}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className="flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Month grids */}
      <div
        className={cn(
          "flex gap-8",
          numberOfMonths === 1 && "justify-center",
        )}
      >
        {months.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            selected={selected}
            hoverDate={hoverDate}
            onDayClick={handleDayClick}
            onDayHover={setHoverDate}
            onDayLeave={() => setHoverDate(null)}
            disabledBefore={disabled?.before}
          />
        ))}
      </div>

      {/* Selection summary footer */}
      {selected?.from && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
            {selected.from.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          {selected.to && (
            <>
              <span className="text-gray-300">→</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-medium">
                {selected.to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export { Calendar };
