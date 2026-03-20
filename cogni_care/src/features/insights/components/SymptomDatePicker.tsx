"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, isBefore, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SymptomDatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  accentColor: string;
}

export default function SymptomDatePicker({
  selectedDate,
  onChange,
  minDate,
  maxDate,
  accentColor,
}: SymptomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Local state for manual text entry - format: dd-mm-yyyy
  const [inputValue, setInputValue] = useState(format(selectedDate, "dd-MM-yyyy"));

  // Sync input value when selectedDate changes externally
  useEffect(() => {
    setInputValue(format(selectedDate, "dd-MM-yyyy"));
    setCurrentMonth(startOfMonth(selectedDate));
  }, [selectedDate]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    onChange(d);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Auto-insert dashes for convenience
    if (val.length === 2 && !val.includes("-") && e.nativeEvent instanceof InputEvent && e.nativeEvent.inputType !== "deleteContentBackward") {
      val += "-";
    } else if (val.length === 5 && val.split("-").length === 2 && e.nativeEvent instanceof InputEvent && e.nativeEvent.inputType !== "deleteContentBackward") {
      val += "-";
    }
    
    setInputValue(val);
    
    // Parse dd-mm-yyyy
    const parts = val.split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const year = parseInt(parts[2], 10);
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year) && parts[2].length === 4) {
        const d = startOfDay(new Date(year, month, day));
        if (!isNaN(d.getTime())) {
          const isWithinBounds = (!minDate || !isBefore(d, startOfDay(minDate))) && 
                                 (!maxDate || !isAfter(d, startOfDay(maxDate)));
          if (isWithinBounds) {
            onChange(d);
            setCurrentMonth(startOfMonth(d));
          }
        }
      }
    }
  };

  const isSelected = (date: Date) => isSameDay(date, selectedDate);
  const isDisabled = (date: Date) => {
    const d = startOfDay(date);
    if (minDate && isBefore(d, startOfDay(minDate))) return true;
    if (maxDate && isAfter(d, startOfDay(maxDate))) return true;
    return false;
  };
  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger: Input Area */}
      <div className="w-full flex items-center bg-white/10 hover:bg-white/20 focus-within:bg-white/20 transition-all rounded-xl px-3 py-2 text-white group relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="bg-transparent border-none outline-none font-bold text-base w-full placeholder:text-white/40"
          placeholder="dd-mm-yyyy"
          maxLength={10}
        />
        <CalendarIcon 
          className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0 ml-2" 
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-[100] bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.25)] p-4 w-[290px] border border-slate-100/50 backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={(e) => { e.stopPropagation(); setCurrentMonth(subMonths(currentMonth, 1)); }}
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
                onClick={(e) => { e.stopPropagation(); setCurrentMonth(addMonths(currentMonth, 1)); }}
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
                      onClick={(e) => { e.stopPropagation(); handleSelect(date); }}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
