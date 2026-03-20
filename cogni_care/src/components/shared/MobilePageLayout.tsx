import React, { ElementType } from "react";
import { ChevronLeft } from "lucide-react";

interface MobilePageLayoutProps {
  title: string;
  subtitle?: string;
  icon: ElementType;
  onBack?: () => void;
  actionRight?: React.ReactNode;
  children: React.ReactNode;
  headerBgClass?: string;
  textClass?: string;
  iconColorClass?: string;
  iconContainerClass?: string;
}

export default function MobilePageLayout({
  title,
  subtitle,
  icon: Icon,
  onBack,
  actionRight,
  children,
  headerBgClass = "bg-[#dcebf5]/90", 
  textClass = "text-[#0B4063]",
  iconColorClass = "text-[#0A4B75]",
  iconContainerClass,
}: MobilePageLayoutProps) {
  // If we have onBack, the container usually looks better as solid white/standard unless overridden
  const finalIconContainerClass = iconContainerClass || "bg-white shadow-sm";
  return (
    <div className="w-full flex flex-col space-y-4 md:space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
      {/* Header Area styled exactly like old dashboard but with icon layout */}
      <header className={`sticky top-0 z-20 -mx-4 -mt-[calc(2rem+env(safe-area-inset-top,0px))] px-4 pt-[calc(2.5rem+env(safe-area-inset-top,0px))] pb-4 mb-2 ${headerBgClass} backdrop-blur-xl border-b border-white/40 shadow-sm flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          
          {/* Icon or Back Button */}
          {onBack ? (
            <button 
              onClick={onBack}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 active:scale-90 transition-transform ${finalIconContainerClass}`}
            >
              <ChevronLeft className={`w-8 h-8 ${iconColorClass}`} strokeWidth={3} />
            </button>
          ) : (
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${finalIconContainerClass}`}>
              <Icon className={`w-6 h-6 ${iconColorClass}`} strokeWidth={2.5} />
            </div>
          )}

          {/* Title & Subtitle */}
          <div className="flex flex-col">
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${textClass}`}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm font-bold opacity-70 tracking-wide mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Optional Action (e.g. "Mark all as read") */}
        {actionRight && (
          <div className={`text-sm font-bold tracking-wide ${textClass} opacity-90`}>
            {actionRight}
          </div>
        )}
      </header>

      {/* Content Area - Transparent to allow global body background to show */}
      <div className="w-full pb-24">
        {children}
      </div>
    </div>
  );
}
