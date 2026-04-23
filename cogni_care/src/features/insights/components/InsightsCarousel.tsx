"use client";

import { useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface InsightsCarouselProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  onIndexChange?: (index: number) => void;
  accentColor?: string | ((item: T) => string);
  className?: string;
  containerClassName?: string;
}

export function InsightsCarousel<T>({
  items,
  renderItem,
  keyExtractor,
  onIndexChange,
  accentColor,
  className,
  containerClassName,
}: InsightsCarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const paginate = useCallback((direction: number) => {
    const nextIndex = (currentIndex + direction + items.length) % items.length;
    setCurrentIndex(nextIndex);
    onIndexChange?.(nextIndex);
  }, [currentIndex, items.length, onIndexChange]);

  if (!items || items.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn("relative overflow-hidden", containerClassName)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={keyExtractor(items[currentIndex], currentIndex)}
            drag={items.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) paginate(1);
              if (info.offset.x > 80) paginate(-1);
            }}
            initial={{ opacity: 0, x: 40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={cn(items.length > 1 ? "cursor-grab active:cursor-grabbing" : "")}
          >
            {renderItem(items[currentIndex])}
          </motion.div>
        </AnimatePresence>
      </div>

      {items.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-1">
          {items.map((item, idx) => {
            const color = typeof accentColor === "function" ? accentColor(item) : accentColor;
            const isActive = idx === currentIndex;
            
            return (
              <button
                key={keyExtractor(item, idx)}
                onClick={() => {
                  setCurrentIndex(idx);
                  onIndexChange?.(idx);
                }}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  isActive ? "w-8" : "w-1.5 opacity-20"
                )}
                style={{ backgroundColor: color || "#6366f1" }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
