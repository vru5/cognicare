"use client";

import { useState, useRef, useEffect } from "react";
import { format, isBefore, isAfter, startOfDay, startOfMonth, addMonths, differenceInMonths } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import Calendar from "./Calendar";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onRangeChange: (start: Date, end: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  accentColor: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  minDate,
  maxDate,
  accentColor,
}: DateRangePickerProps) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  
  const [startMonth, setStartMonth] = useState(startOfMonth(startDate));
  const [endMonth, setEndMonth] = useState(startOfMonth(endDate));

  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (startRef.current && !startRef.current.contains(event.target as Node)) setIsStartOpen(false);
      if (endRef.current && !endRef.current.contains(event.target as Node)) setIsEndOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStartSelect = (date: Date) => {
    const d = startOfDay(date);
    let newEnd = endDate;
    
    // Ensure end date is not before start date
    if (isAfter(d, startOfDay(endDate))) {
      newEnd = d;
    }
    
    // Check 6 months constraint
    if (differenceInMonths(newEnd, d) > 6) {
      newEnd = addMonths(d, 6);
      if (maxDate && isAfter(newEnd, maxDate)) newEnd = startOfDay(maxDate);
    }

    onRangeChange(d, newEnd);
    setIsStartOpen(false);
  };

  const handleEndSelect = (date: Date) => {
    const d = startOfDay(date);
    let newStart = startDate;

    // Ensure start date is not after end date
    if (isBefore(d, startOfDay(startDate))) {
      newStart = d;
    }

    // Check 6 months constraint
    if (differenceInMonths(d, newStart) > 6) {
      newStart = addMonths(d, -6);
      if (minDate && isBefore(newStart, minDate)) newStart = startOfDay(minDate);
    }

    onRangeChange(newStart, d);
    setIsEndOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mx-auto">
      {/* Start Date */}
      <div className="relative w-full" ref={startRef}>
        <div 
          onClick={() => setIsStartOpen(!isStartOpen)}
          className="w-full flex items-center bg-slate-50 hover:bg-slate-100 transition-all rounded-2xl px-4 py-3 text-slate-800 cursor-pointer border border-slate-100 active:scale-95 shadow-sm"
        >
          <div className="flex flex-col flex-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Start Date</span>
            <span className="font-bold text-sm tracking-tight">{format(startDate, "MMM d, yyyy")}</span>
          </div>
          <CalendarIcon className="w-5 h-5 text-slate-400 ml-2" />
        </div>

        <AnimatePresence>
          {isStartOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-[110] drop-shadow-2xl"
            >
              <Calendar
                currentMonth={startMonth}
                selectedDate={startDate}
                onMonthChange={setStartMonth}
                onSelect={handleStartSelect}
                minDate={minDate}
                maxDate={maxDate}
                accentColor={accentColor}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="hidden sm:block opacity-40"><ArrowRight className="w-5 h-5 text-slate-400" /></div>

      {/* End Date */}
      <div className="relative w-full" ref={endRef}>
        <div 
          onClick={() => setIsEndOpen(!isEndOpen)}
          className="w-full flex items-center bg-slate-50 hover:bg-slate-100 transition-all rounded-2xl px-4 py-3 text-slate-800 cursor-pointer border border-slate-100 active:scale-95 shadow-sm"
        >
          <div className="flex flex-col flex-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">End Date</span>
            <span className="font-bold text-sm tracking-tight">{format(endDate, "MMM d, yyyy")}</span>
          </div>
          <CalendarIcon className="w-5 h-5 text-slate-400 ml-2" />
        </div>

        <AnimatePresence>
          {isEndOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-[110] drop-shadow-2xl"
            >
              <Calendar
                currentMonth={endMonth}
                selectedDate={endDate}
                onMonthChange={setEndMonth}
                onSelect={handleEndSelect}
                minDate={startDate} // Constraint: end cannot be before current start
                maxDate={maxDate}
                accentColor={accentColor}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
