"use client";

import { useMemo } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, isBefore, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarProps {
  currentMonth: Date;
  selectedDate?: Date;
  onMonthChange: (date: Date) => void;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  accentColor: string;
}

export default function Calendar({
  currentMonth,
  selectedDate,
  onMonthChange,
  onSelect,
  minDate,
  maxDate,
  accentColor,
}: CalendarProps) {
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start, end });
    const firstDayOfWeek = start.getDay();
    const padding = Array(firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1).fill(null);
    return [...padding, ...allDays];
  }, [currentMonth]);

  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];

  const handleSelect = (date: Date) => {
    const d = startOfDay(date);
    if (minDate && isBefore(d, startOfDay(minDate))) return;
    if (maxDate && isAfter(d, startOfDay(maxDate))) return;
    onSelect(d);
  };

  const isSelected = (date: Date) => selectedDate ? isSameDay(date, selectedDate) : false;
  const isDisabled = (date: Date) => {
    const d = startOfDay(date);
    if (minDate && isBefore(d, startOfDay(minDate))) return true;
    if (maxDate && isAfter(d, startOfDay(maxDate))) return true;
    return false;
  };
  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="w-[260px] bg-white rounded-[2rem] p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] pointer-events-none" style={{ color: accentColor }}>
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-2 px-1">
        {daysOfWeek.map((d, i) => (
          <div key={i} className="text-[9px] font-black text-slate-200 text-center uppercase tracking-widest pointer-events-none">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-y-1 px-1">
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="h-9 w-9" />;

          const selected = isSelected(date);
          const disabled = isDisabled(date);
          const todayStatus = isToday(date);

          return (
            <div key={date.toISOString()} className="flex justify-center items-center">
              <button
                type="button"
                onClick={() => handleSelect(date)}
                disabled={disabled}
                className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all relative
                  ${selected
                    ? "text-white shadow-xl"
                    : disabled
                      ? "text-slate-200/50 cursor-not-allowed"
                      : "text-slate-600 hover:bg-slate-50 hover:scale-110"
                  }
                `}
                style={{
                  backgroundColor: selected ? accentColor : 'transparent',
                  boxShadow: selected ? `0 8px 16px -4px ${accentColor}cc` : 'none'
                }}
              >
                {date.getDate()}
                {todayStatus && !selected && (
                  <div
                    className="absolute bottom-1 w-1 h-1 rounded-full animate-pulse"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
