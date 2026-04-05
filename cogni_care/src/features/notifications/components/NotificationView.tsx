"use client";

import { useNotifications } from "@/contexts/NotificationContext";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, CheckCircle2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

import { NotificationRecord, NotificationData } from "@/features/notifications/types/notificationType";
import MobilePageLayout from "@/components/shared/MobilePageLayout";

export default function NotificationsView() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const router = useRouter();

    const handleNotificationClick = async (notification: NotificationRecord) => {
        // Mark as read immediately in UI
        if (!notification.read) {
            await markAsRead(notification.id);
        }

        // Deep link logic
        try {
            let data: NotificationData = {};
            
            if (typeof notification.data === 'string') {
                try { 
                    data = JSON.parse(notification.data) as NotificationData; 
                } catch (e) { 
                    data = {}; 
                }
            } else if (notification.data) {
                // If data is already an object, use it directly
                data = notification.data as NotificationData;
            }

            // Both logId (comment on log) and note_id (direct log) work as targetId
            const targetId = data.logId || data.note_id;
            
            if (targetId) {
                console.log(`[NotificationsPage] Navigating to log: ${targetId}`);
                router.push(`/logs?logId=${targetId}`);
            } else {
                console.log('[NotificationsPage] No target ID found, going to general logs');
                router.push('/logs');
            }
        } catch (error) {
            console.error('[NotificationsPage] Navigation error:', error);
            router.push('/logs');
        }
    };

    return (
        <MobilePageLayout
            title="Notifications"
            icon={Bell}
            onBack={() => router.push('/logs')}
            iconContainerClass="bg-gradient-to-br from-primary to-[#0A4B75] shadow-lg shadow-primary/20"
            iconColorClass="text-white"
            actionRight={
                unreadCount > 0 && (
                    <button 
                        onClick={markAllAsRead}
                        className="hover:opacity-80 transition-opacity"
                    >
                        Mark all as read
                    </button>
                )
            }
        >

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
                                "transition-all hover:shadow-md cursor-pointer active:scale-[0.99] border-l-4",
                                !notification.read 
                                    ? "border-l-sky-500 bg-sky-50/80 shadow-sm ring-1 ring-sky-100" 
                                    : "border-l-transparent bg-card shadow-none"
                            )}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <CardContent className="p-5">
                                <div className="flex gap-4">
                                    <div className={cn(
                                        "h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center",
                                        notification.read ? "bg-muted" : "bg-primary/20 shadow-inner"
                                    )}>
                                        {notification.read ? (
                                            <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                                        ) : (
                                            <Bell className="w-6 h-6 text-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className={cn(
                                                "font-bold text-base leading-tight",
                                                !notification.read ? "text-primary" : "text-foreground"
                                            )}>
                                                {notification.title}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground/90 leading-relaxed font-medium">
                                            {notification.body}
                                        </p>
                                        <div className="flex items-center justify-between pt-2">
                                            <p className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1">
                                                View details <CheckCircle2 className="w-3 h-3" />
                                            </p>
                                            {!notification.read && (
                                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </MobilePageLayout>
    );
}


