"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, FileText, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const BottomNavbar = () => {
    const pathname = usePathname();
    const { user } = useAuth();

    const navItems = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
            show: user?.isCarer,
        },
        {
            label: "Mind Dump",
            icon: Brain,
            href: "/brain-dump",
            show: !user?.isCarer,
        },
        {
            label: "Logs",
            icon: FileText,
            href: "/logs",
            show: !user?.isCarer,
        },
    ].filter(item => item.show);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t bg-background/80 backdrop-blur-md pb-safe">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 transition-colors hover:text-primary",
                            isActive ? "text-primary font-medium" : "text-muted-foreground"
                        )}
                    >
                        <item.icon className={cn("h-6 w-6", isActive && "animate-pulse")} />
                        <span className="text-xs">{item.label}</span>
                        {isActive && (
                            <div className="h-1 w-1 rounded-full bg-primary" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
};

export default BottomNavbar;
