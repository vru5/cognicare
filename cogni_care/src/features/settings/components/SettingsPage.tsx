"use client";

import { Settings, LogOut, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function MenuItem({
    icon,
    label,
    description,
    href,
}: {
    icon: React.ReactNode;
    label: string;
    description: string;
    href: string;
}) {
    return (
        <Link href={href} className="block group">
            <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        {icon}
                    </div>
                    <div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">{label}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
            </div>
        </Link>
    );
}

export default function SettingsContent() {
    const { user, logout } = useAuth();

    return (
        <div className="max-w-md mx-auto space-y-4 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="sticky top-0 z-10 -mx-4 -mt-[calc(2rem+env(safe-area-inset-top,0px))] px-4 pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-4 mb-4 bg-background/80 backdrop-blur-xl border-b border-border/50 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <Settings className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            </div>

            {/* Menu items */}
            <div className="space-y-3 px-4">
                <MenuItem
                    href="/settings/manage-profile"
                    icon={<User className="w-5 h-5" />}
                    label="Manage Profile"
                    description="Edit your name, email and account info"
                />

                {/* Patient only */}
                {!user?.isCarer && (
                    <MenuItem
                        href="/settings/manageCarer"
                        icon={<ShieldCheck className="w-5 h-5" />}
                        label="Manage Carer Access"
                        description="Control who can see your health records"
                    />
                )}
            </div>

            {/* Sign out */}
            <div className="pt-4 px-4">
                <Button
                    variant="destructive"
                    className="w-full h-12 rounded-xl text-base font-black bg-destructive shadow-lg shadow-destructive/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    onClick={logout}
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
