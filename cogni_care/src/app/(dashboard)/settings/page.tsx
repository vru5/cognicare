"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Settings, Construction, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    const { user, logout } = useAuth();

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <Settings className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            </div>

            <Card className="overflow-hidden">
                <CardContent className="p-0 divide-y">
                    <div className="p-6 flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">{user?.name}</h2>
                            <p className="text-sm text-muted-foreground capitalize">{user?.role?.toLowerCase()}</p>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                        <Construction className="w-12 h-12 text-muted-foreground" />
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg">Detailed Preferences coming soon</h3>
                            <p className="text-sm text-muted-foreground">
                                Notification settings, account security, and themes are being prepared for you.
                            </p>
                        </div>
                    </div>

                    <div className="p-6">
                        <Button 
                            variant="destructive" 
                            className="w-full flex items-center gap-2 h-12 text-base font-bold rounded-xl"
                            onClick={logout}
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
