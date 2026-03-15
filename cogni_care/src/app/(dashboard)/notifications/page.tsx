"use client";

import { useNotifications } from "@/contexts/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Bell className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                </div>
                {unreadCount > 0 && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={markAllAsRead}
                        className="text-primary hover:text-primary/80 font-medium"
                    >
                        Mark all as read
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <Card className="border-dashed py-12">
                    <CardContent className="flex flex-col items-center justify-center text-center space-y-3">
                        <div className="p-4 bg-muted rounded-full">
                            <Bell className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">No notifications yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <Card 
                            key={notification.id}
                            className={cn(
                                "transition-all hover:shadow-md",
                                !notification.read && "border-primary/50 bg-primary/5 shadow-sm"
                            )}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                            <CardContent className="p-5">
                                <div className="flex gap-4">
                                    <div className={cn(
                                        "h-10 w-10 shrink-0 rounded-full flex items-center justify-center",
                                        notification.read ? "bg-muted" : "bg-primary/20"
                                    )}>
                                        {notification.read ? (
                                            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                                        ) : (
                                            <Bell className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className={cn(
                                                "font-semibold leading-none",
                                                !notification.read && "text-primary"
                                            )}>
                                                {notification.title}
                                            </p>
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {notification.body}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
