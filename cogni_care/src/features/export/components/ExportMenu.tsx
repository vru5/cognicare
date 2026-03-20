"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, FileText, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ExportMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    {
      label: "Download",
      icon: Download,
      onClick: () => {
        console.log("Downloading data...");
        setIsOpen(false);
      },
    },
    {
      label: "Export Doc Form",
      icon: FileText,
      onClick: () => {
        console.log("Exporting doc form...");
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary to-[#0A4B75] text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-primary/20",
          isOpen && "ring-2 ring-primary/40 ring-offset-2"
        )}
      >
        <span>Export Data</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-52 bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-slate-900/10">
          <div className="py-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-900 hover:bg-primary/5 hover:text-primary transition-colors text-left"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
