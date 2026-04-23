"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HelpTooltipProps {
  content: ReactNode | ((close: () => void) => ReactNode);
  className?: string;
  buttonClassName?: string;
}

export default function HelpTooltip({ content, className, buttonClassName }: HelpTooltipProps) {
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const close = () => setShowPopover(false);

  // Close popover on click outside or scroll
  useEffect(() => {
    if (!showPopover) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowPopover(false);
      }
    };

    const handleScroll = () => {
      setShowPopover(false);
    };

    window.addEventListener("pointerdown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("touchmove", handleScroll, true);

    return () => {
      window.removeEventListener("pointerdown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("touchmove", handleScroll, true);
    };
  }, [showPopover]);

  return (
    <div ref={popoverRef} className={cn("relative inline-block", className)}>
      <button 
        onPointerDown={(e) => {
          e.stopPropagation();
          setShowPopover(!showPopover);
        }}
        className={cn("text-slate-300 hover:text-primary transition-colors focus:outline-none", buttonClassName)}
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {showPopover && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[100] top-full right-0 mt-2 w-64 p-4 bg-[#0A4B75] text-white rounded-2xl shadow-2xl text-left border border-white/10"
          >
            <div className="text-[11px] font-bold leading-relaxed opacity-90">
              {typeof content === "function" ? content(close) : content}
            </div>
            {/* Arrow (Pointing up) */}
            <div className="absolute bottom-full right-2 border-8 border-transparent border-b-[#0A4B75]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
