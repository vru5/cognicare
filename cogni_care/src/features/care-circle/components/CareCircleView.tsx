"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Users, MessageSquare, Phone, CheckCircle2, ChevronRight, User } from "lucide-react";
import MobilePageLayout from "@/components/shared/MobilePageLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ChatThread, ChatMessage, ChatNavigationParams } from "../types/chatTypes";
import { resolveThread, getContacts, getThreads, getOrCreateDirectChat } from "../services/careCircleService";
import { CHAT_QUERY_PARAMS, CHAT_STRINGS, CHAT_TABS, CHAT_TYPES } from "../constants/chatConstants";
import { useChatDeepLink } from "../hooks/useChatDeepLink";
import { useChat } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import { HOTLINE_URL } from "@/constants/auth";
import ChatInterface from "./ChatInterface";
import { getSocket } from "@/lib/socket";

export default function CareCircleView() {
    const { user } = useAuth();
    const { canAccessCareCircle } = useChat();
    const [activeTab, setActiveTab] = useState<typeof CHAT_TABS.THREADS | typeof CHAT_TABS.DIRECT>(CHAT_TABS.THREADS);
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState<ChatNavigationParams | null>(null);
    const router = useRouter();
    const { deepLinkChat, clearDeepLink } = useChatDeepLink();

    useEffect(() => {
        if (deepLinkChat) {
            setSelectedChat(deepLinkChat);
        }
    }, [deepLinkChat]);

    const fetchData = async () => {
        if (!user?.profileId) return;
        setLoading(true);
        try {
            const [threadsRes, contactsRes] = await Promise.all([
                getThreads(user.profileId, user.isCarer),
                getContacts(user.profileId, user.isCarer)
            ]);

            if (threadsRes.success) setThreads(threadsRes.threads);
            if (contactsRes.success) {
                const normalized = user.isCarer 
                    ? contactsRes.patients 
                    : contactsRes.carers.filter((c: any) => c.accessCareCircle);
                setContacts(normalized);
            }
        } catch (error) {
            console.error("Failed to fetch Care Circle data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch dynamic data
    useEffect(() => {
        fetchData();

        if (user?.profileId) {
            const socket = getSocket(user.profileId);
            const handleUnreadUpdate = () => {
                console.log("[CareCircleView] Unread update received, refreshing list...");
                fetchData();
            };
            socket.on("unread_update", handleUnreadUpdate);
            return () => {
                socket.off("unread_update", handleUnreadUpdate);
            };
        }
    }, [user?.profileId]);

    const handleResolve = async (threadId: string) => {
        const confirmResult = window.confirm(CHAT_STRINGS.RESOLVE_CONFIRM);
        if (!confirmResult) return;

        const result = await resolveThread(threadId);
        if (result.success) {
            setThreads(prev => prev.filter(t => t.id !== threadId));
            if (selectedChat?.chatId === threadId) setSelectedChat(null);
        }
    };

    const handleStartDirectChat = async (contactId: string, contactName: string) => {
        if (!user?.profileId) return;
        
        try {
            const patientId = user.isCarer ? contactId : user.profileId;
            const carerId = user.isCarer ? user.profileId : contactId;
            
            const result = await getOrCreateDirectChat(patientId, carerId);
            if (result.success) {
                setSelectedChat({
                    chatId: result.chat.id,
                    type: CHAT_TYPES.DIRECT,
                    title: contactName
                });
            }
        } catch (error) {
            console.error("Failed to start direct chat:", error);
        }
    };

    if (user?.isCarer && !canAccessCareCircle) {
        return (
            <MobilePageLayout
                title="Care Circle"
                icon={Users}
                headerBgClass="bg-[#E3F2FD]/95" 
                textClass="text-[#0B4063]"
                iconContainerClass="bg-gradient-to-br from-primary to-[#0A4B75] shadow-lg shadow-primary/20"
                iconColorClass="text-white"
            >
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-8">
                    <div className="p-6 bg-slate-100 rounded-full">
                        <Users className="w-12 h-12 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-black text-[#0B4063]">Access Restricted</h2>
                    <p className="text-muted-foreground font-medium leading-relaxed">
                        The patient has restricted access to the Care Circle. 
                        Please contact the patient if you believe this is an error.
                    </p>
                    <Button 
                        onClick={() => router.push("/dashboard")}
                        className="mt-4 bg-primary text-white rounded-2xl px-8 h-14 font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </MobilePageLayout>
        );
    }

    if (selectedChat) {
        return (
            <ChatInterface 
                chatId={selectedChat.chatId} 
                type={selectedChat.type} 
                title={selectedChat.title || ""} 
                onBack={() => {
                    setSelectedChat(null);
                    clearDeepLink();
                    fetchData(); // Refresh counts when returning
                }} 
            />
        );
    }

    return (
        <MobilePageLayout
            title="Care Circle"
            icon={Users}
            headerBgClass="bg-[#E3F2FD]/95" 
            textClass="text-[#0B4063]"
            iconContainerClass="bg-gradient-to-br from-primary to-[#0A4B75] shadow-lg shadow-primary/20"
            iconColorClass="text-white"
            headerBottom={!user?.isCarer && (
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-gradient-to-br from-[#F87171] to-[#DC2626] border-none text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-500/20 px-4 h-11 flex gap-2"
                    onClick={() => window.open(HOTLINE_URL, "_blank")}
                >
                    <Phone className="w-4 h-4 fill-current" />
                    Hotline
                </Button>
            )}
        >
            <div className="flex flex-col gap-6">
                {/* Tab Switcher */}
                <div className="px-4">
                    <div className="flex p-1 bg-[#F1F5F9]/80 backdrop-blur-md rounded-2xl w-full border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setActiveTab(CHAT_TABS.THREADS)}
                            className={cn(
                                "flex-1 py-3 text-sm font-black rounded-xl transition-all relative flex items-center justify-center gap-2",
                                activeTab === CHAT_TABS.THREADS ? "bg-white shadow-sm text-primary" : "text-muted-foreground"
                            )}
                        >
                            Active Threads
                            {threads.some(t => (t as any).unreadCount > 0) && (
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab(CHAT_TABS.DIRECT)}
                            className={cn(
                                "flex-1 py-3 text-sm font-black rounded-xl transition-all relative flex items-center justify-center gap-2",
                                activeTab === CHAT_TABS.DIRECT ? "bg-white shadow-sm text-primary" : "text-muted-foreground"
                            )}
                        >
                            Contacts
                            {contacts.some(c => c.unreadCount > 0) && (
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="px-4 flex flex-col gap-6 mt-2">
                    {activeTab === "threads" ? (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-10 text-muted-foreground">{CHAT_STRINGS.LOADING_DISCUSSIONS}</div>
                            ) : threads.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/30 rounded-3xl border-2 border-dashed">
                                    <div className="p-4 bg-white rounded-full shadow-sm">
                                        <MessageSquare className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">{CHAT_STRINGS.NO_DISCUSSIONS}</p>
                                </div>
                            ) : (
                                threads.map(thread => (
                                        <div 
                                            key={thread.id} 
                                            onClick={() => setSelectedChat({ chatId: thread.id, type: CHAT_TYPES.THREAD, title: thread.title })}
                                            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform relative">
                                                    <MessageSquare className="w-6 h-6 text-primary" />
                                                    {(thread as any).unreadCount > 0 && (
                                                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg shadow-green-500/20">
                                                            {(thread as any).unreadCount}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-[#0B4063] leading-tight">{thread.title}</h3>
                                                    <p className="text-xs text-muted-foreground font-medium">Contextual Discussion</p>
                                                </div>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold px-4 shadow-md shadow-green-200 active:scale-95 transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleResolve(thread.id);
                                                }}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                                {CHAT_STRINGS.RESOLVE_BUTTON}
                                            </Button>
                                        </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-10 text-muted-foreground">{CHAT_STRINGS.LOADING_CONTACTS}</div>
                            ) : contacts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/30 rounded-3xl border-2 border-dashed">
                                    <div className="p-4 bg-white rounded-full shadow-sm">
                                        <Users className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">{CHAT_STRINGS.NO_CONTACTS}</p>
                                    <p className="text-xs text-muted-foreground px-10">{CHAT_STRINGS.CONTACTS_ACCESS_HELP}</p>
                                </div>
                            ) : (
                                contacts.map(contact => (
                                    <div key={contact.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-900/5 space-y-6 relative overflow-hidden">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-[#0A4B75] rounded-2xl shadow-lg flex items-center justify-center border-2 border-white relative">
                                                <User className="w-8 h-8 text-white" />
                                                {contact.unreadCount > 0 && (
                                                    <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-bounce">
                                                        {contact.unreadCount}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-black text-xl text-[#0B4063]">{contact.name}</h3>
                                                </div>
                                                <p className="text-sm text-slate-500 font-bold">
                                                    {user?.isCarer ? "Authorized Patient" : "Authorized Professional"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <Button 
                                                onClick={() => handleStartDirectChat(contact.id, contact.name)}
                                                className="w-full h-16 rounded-2xl font-black text-xl bg-gradient-to-br from-primary to-[#0A4B75] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex gap-4"
                                            >
                                                <MessageSquare className="w-8 h-8" />
                                                Start Chatting
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </MobilePageLayout>
    );
}
