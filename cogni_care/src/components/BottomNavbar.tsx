"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, FileText, LayoutDashboard, Bell, LineChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

const BottomNavbar = () => {
    const pathname = usePathname();
    const { user } = useAuth();
    const { unreadCount } = useNotifications();

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
        {
            label: "Insights",
            icon: LineChart,
            href: "/insights",
            show: true,
        },
        {
            label: "Notifications",
            icon: Bell,
            href: "/notifications",
            show: !user?.isCarer,
            hasBadge: unreadCount > 0,
        },
        {
            label: "Settings",
            icon: Settings,
            href: "/settings",
            show: true,
        },
    ].filter(item => item.show);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t bg-background/80 backdrop-blur-md pb-safe px-2">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "relative flex flex-col items-center justify-center gap-1 transition-colors hover:text-primary min-w-[64px]",
                            isActive ? "text-primary font-medium" : "text-muted-foreground"
                        )}
                    >
                        <div className="relative">
                            <item.icon className={cn("h-6 w-6", isActive && "animate-pulse")} />
                            {item.hasBadge && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3 rounded-full bg-destructive border-2 border-background" />
                            )}
                        </div>
                        <span className="text-[10px] sm:text-xs">{item.label}</span>
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
