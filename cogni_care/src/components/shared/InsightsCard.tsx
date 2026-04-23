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

import HelpTooltip from "./HelpTooltip";
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
          <div className="absolute right-0 top-0 z-10">
            <HelpTooltip 
              content={(close) => (
                <>
                  Learn more how the levels are calculated{" "}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      close();
                      onHelpClick();
                    }}
                    className="inline font-black text-white underline decoration-sky-300 underline-offset-2 hover:text-sky-200 transition-colors uppercase tracking-widest"
                  >
                    here
                  </button>
                </>
              )}
            />
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
