"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, FileText, LayoutDashboard, LineChart, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";

const BottomNavbar = () => {
    const pathname = usePathname();
    const { user } = useAuth();
    const { totalUnreadCount, canAccessCareCircle } = useChat();

    if (pathname.includes("/doc-form")) {
        return null;
    }

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
            label: "Care Circle",
            icon: Users,
            href: "/care-circle",
            show: user?.isCarer ? canAccessCareCircle : true,
        },
        {
            label: "Insights",
            icon: LineChart,
            href: "/insights",
            show: true,
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
                            {item.label === "Care Circle" && totalUnreadCount > 0 && (
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm">
                                    {totalUnreadCount > 9 ? "9+" : totalUnreadCount}
                                </div>
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
