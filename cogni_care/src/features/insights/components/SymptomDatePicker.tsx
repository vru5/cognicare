"use client";

import { useState, useRef, useEffect } from "react";
import { format, startOfMonth, isBefore, isAfter, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon } from "lucide-react";
import Calendar from "@/components/shared/Calendar";
import { SymptomDatePickerProps } from "../types/insightsTypes";

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

  const handleSelect = (date: Date) => {
    onChange(date);
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
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-[100] drop-shadow-2xl"
          >
            <Calendar
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              onMonthChange={setCurrentMonth}
              onSelect={handleSelect}
              minDate={minDate}
              maxDate={maxDate}
              accentColor={accentColor}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
