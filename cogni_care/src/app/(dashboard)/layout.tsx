"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNavbar from "@/components/BottomNavbar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isBrainDump = pathname === "/brain-dump";

    return (
        <ProtectedRoute>
            <div className={`pb-24 px-4 ${!isBrainDump ? "pt-[calc(2rem+env(safe-area-inset-top,0px))]" : ""}`}>
                {children}
            </div>
            <BottomNavbar />
        </ProtectedRoute>
    );
}
