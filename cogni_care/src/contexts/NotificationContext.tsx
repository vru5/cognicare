"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { NotificationRecord } from '@/features/notifications/types/notificationType';

interface NotificationContextType {
    notifications: NotificationRecord[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        const targetId = user.profileId || user.userId;
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('userId', targetId);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        if (!user) return;
        const targetId = user.profileId || user.userId;

        const fetchNotifications = async () => {
            console.log(`[NotificationProvider] Fetching notifications for ${targetId}`);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('userId', targetId)
                .order('createdAt', { ascending: false });

            if (error) {
                console.error('[NotificationProvider] Failed to fetch notifications:', error);
                return;
            }

            if (data) {
                setNotifications(data as NotificationRecord[]);
                setUnreadCount(data.filter(n => !n.read).length);
            }
        };

        fetchNotifications();

        console.log(`[NotificationProvider] Subscribing to notifications for user ${targetId}`);

        const channel = supabase.channel(`user_notifications:${targetId}`)
            .on(
                'broadcast',
                { event: 'new_notification' },
                (payload: { payload: NotificationRecord }) => {
                    console.log('[NotificationProvider] New broadcast notification received:', payload);
                    const newNotif = payload.payload;
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('[NotificationProvider] Successfully subscribed to realtime broadcasts');
                }
            });

        return () => {
            console.log('[NotificationProvider] Unsubscribing from notifications');
            supabase.removeChannel(channel);
        };
    }, [user?.userId, user?.profileId]);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
