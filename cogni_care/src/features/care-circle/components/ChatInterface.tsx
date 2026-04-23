"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getMessages, sendMessage } from "../services/careCircleService";
import { ChatMessage, ChatInterfaceProps } from "../types/chatTypes";
import { CHAT_STRINGS, CHAT_ENDPOINTS } from "../constants/chatConstants";
import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { useChat } from "@/contexts/ChatContext";
import { API_BASE_URL } from "@/constants/auth";
import { useCallback } from "react";


export default function ChatInterface({ chatId, type, title, onBack }: ChatInterfaceProps) {
    const { user } = useAuth();
    const { refreshUnreadCount } = useChat();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const markRead = useCallback(async () => {
        if (!user?.profileId) return;
        try {
            await fetch(`${API_BASE_URL}${CHAT_ENDPOINTS.READ}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatId,
                    type,
                    profileId: user.profileId,
                    isCarer: user.isCarer
                })
            });
            refreshUnreadCount();
        } catch (error) {
            console.error("[ChatInterface] Failed to mark as read:", error);
        }
    }, [chatId, type, user, refreshUnreadCount]);

    // Initial message fetch
    useEffect(() => {
        const fetchMessages = async () => {
            const params = type === "thread" ? { threadId: chatId } : { directChatId: chatId };
            try {
                const result = await getMessages(params);
                if (result.success) {
                    setMessages(result.messages);
                    markRead(); // Mark as read once loaded
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        const socket = getSocket(user?.profileId || "");
        const roomId = chatId;

        const handleNewMessage = (message: ChatMessage) => {
            if (message.threadId === chatId || message.directChatId === chatId) {
                setMessages(prev => [...prev, message]);
                markRead(); // Mark as read when new message arrives while open
            }
        };

        const onConnect = () => {
            console.log(`[Socket] Re-joining room: ${roomId}`);
            socket.emit("join_room", roomId);
        };

        // Immediate join and listen for future reconnections
        socket.emit("join_room", roomId);
        socket.on("connect", onConnect);
        socket.on("new_message", handleNewMessage);

        return () => {
            socket.emit("leave_room", roomId);
            socket.off("connect", onConnect);
            socket.off("new_message", handleNewMessage);
        };
    }, [chatId, type, user, markRead]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const data = {
            senderId: user?.userId || "",
            content: newMessage.trim(),
            threadId: type === "thread" ? chatId : undefined,
            directChatId: type === "direct" ? chatId : undefined,
        };

        try {
            const result = await sendMessage(data);
            if (result.success) {
                setNewMessage("");
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] fixed inset-0 z-[100] animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="bg-[#0B4063]/95 text-white p-4 pt-[max(1rem,calc(env(safe-area-inset-top)+0.5rem))] flex items-center gap-3 shadow-xl backdrop-blur-md border-b border-white/10">
                <button 
                    onClick={onBack} 
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center active:scale-90 transition-transform hover:bg-white/20"
                >
                    <ArrowLeft className="w-6 h-6 outline-none" strokeWidth={3} />
                </button>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner border border-white/10">
                    <User className="w-7 h-7 text-white" />
                </div>
                <div className="flex flex-col">
                    <h2 className="font-black text-xl leading-tight tracking-tight truncate max-w-[200px]">{title}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{CHAT_STRINGS.CHAT_SUBTITLE}</p>
                </div>
            </div>

            {/* Messages Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50"
            >
                {messages.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4">
                        <MessageSquare className="w-12 h-12" />
                        <p className="font-bold text-sm uppercase tracking-widest text-center">{CHAT_STRINGS.START_CONVERSATION}</p>
                    </div>
                )}
                {messages.map((msg, index) => {
                    const isSelf = msg.senderId === user?.userId;
                    return (
                        <div key={msg.id} className={cn("flex w-full flex-col", isSelf ? "items-end" : "items-start")}>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest mb-1 opacity-60",
                                isSelf ? "mr-4 text-[#0B4063]" : "ml-4 text-primary"
                            )}>
                                {msg.sender.name}
                            </span>
                            <div className={cn(
                                "max-w-[85%] px-5 py-3 rounded-[2rem] shadow-sm relative animate-in slide-in-from-bottom-2 duration-300",
                                isSelf 
                                    ? "bg-[#0B4063] text-white rounded-tr-none shadow-blue-900/10" 
                                    : "bg-[#E3F2FD] text-[#0B4063] rounded-tl-none border border-blue-100 shadow-blue-900/5"
                            )}>
                                <p className="text-[15px] font-bold leading-relaxed break-words">{msg.content}</p>
                                <div className={cn(
                                    "text-[10px] mt-1 flex justify-end font-black tracking-tighter opacity-60",
                                    isSelf ? "text-white" : "text-primary"
                                )}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div className="bg-white/80 backdrop-blur-xl p-4 pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                <div className="flex items-end gap-3 max-w-4xl mx-auto bg-slate-100/50 rounded-[2.5rem] p-2 pl-5 pr-2 shadow-inner border border-slate-200/50 focus-within:bg-white focus-within:shadow-md transition-all duration-300">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={CHAT_STRINGS.MESSAGE_PLACEHOLDER}
                        className="flex-1 max-h-32 min-h-[45px] py-3 resize-none bg-transparent border-none focus:ring-0 text-[15px] font-bold text-slate-800 placeholder:text-slate-400 custom-scrollbar"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <Button 
                        size="icon" 
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sending}
                        className={cn(
                            "w-12 h-12 rounded-full transition-all active:scale-90 flex-shrink-0 shadow-lg",
                            newMessage.trim() 
                                ? "bg-[#0B4063] text-white shadow-blue-900/20" 
                                : "bg-slate-200 text-slate-400 shadow-none grayscale"
                        )}
                    >
                        <Send className="w-5 h-5 fill-current" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
