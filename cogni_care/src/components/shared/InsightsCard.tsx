"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InsightsCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  subtitleClassName?: string;
  accentColor?: string;
  isLocked?: boolean;
  onHelpClick?: () => void;
}

import { HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InsightsCard({
  title,
  subtitle,
  children,
  className,
  headerClassName,
  subtitleClassName,
  onHelpClick,
}: InsightsCardProps) {
  const [showPopover, setShowPopover] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Close popover on click outside or scroll
  React.useEffect(() => {
    if (!showPopover) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowPopover(false);
      }
    };

    const handleScroll = () => {
      setShowPopover(false);
    };

    // Use capture to catch scroll/touch events from any level
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
    <div
      className={cn(
        "w-full bg-white rounded-[2rem] p-5 pb-8 flex flex-col gap-5 shadow-sm border border-white/20 outline-none relative",
        className
      )}
    >
      {/* Header */}
      <div className={cn("text-center pt-2 relative", headerClassName)}>
        {onHelpClick && (
          <div ref={popoverRef} className="absolute right-0 top-0 z-10">
            <button 
              onPointerDown={(e) => {
                e.stopPropagation();
                setShowPopover(!showPopover);
              }}
              className="text-slate-300 hover:text-primary transition-colors focus:outline-none"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showPopover && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute z-[100] top-full right-0 mt-2 w-56 p-4 bg-[#0A4B75] text-white rounded-2xl shadow-2xl text-left border border-white/10"
                >
                  <p className="text-[10px] font-bold leading-relaxed opacity-90">
                    Learn more how the levels are calculated{" "}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPopover(false);
                        onHelpClick();
                      }}
                      className="inline font-black text-white underline decoration-sky-300 underline-offset-2 hover:text-sky-200 transition-colors uppercase tracking-widest"
                    >
                      here
                    </button>
                  </p>
                  {/* Arrow */}
                  <div className="absolute bottom-full right-2 border-8 border-transparent border-b-[#0A4B75]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {subtitle && (
          <p className={cn("text-xs font-black uppercase tracking-widest text-primary/60 mb-3 px-10", subtitleClassName)}>
            {subtitle}
          </p>
        )}
        
        <h2 className="text-4xl md:text-5xl font-black text-foreground leading-tight">
          {title.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < title.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </h2>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 w-full">
        {children}
      </div>
    </div>
  );
}
