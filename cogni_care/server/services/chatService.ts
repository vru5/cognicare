import { prisma } from "../lib/prisma.js";
import { createInAppNotification, sendChatPushNotificationAction } from "../lib/notificationService.js";
import { getIO } from "../lib/socket.js";
import { NOTIFICATION_TYPES, NOTIFICATION_TEMPLATES } from "../constants/chatConstants.js";

export const createThreadFromNote = async (noteId: string, patientId: string, authorCarerId: string) => {
    // Check if thread already exists for this note
    const existingThread = await prisma.chatThread.findUnique({
        where: { noteId }
    });

    if (existingThread) {
        return { success: true, thread: existingThread };
    }

    // Get note to create title
    const note = await prisma.carerNote.findUnique({
        where: { id: noteId },
        include: { log: true }
    });

    if (!note) {
        throw new Error("Note not found");
    }

    const title = `Ref: ${note.log?.physical ? 'Physical' : note.log?.mood ? 'Mood' : note.log?.cognitive ? 'Cognitive' : 'Observation'} - ${new Date(note.createdAt).toLocaleDateString()}`;

    const thread = await prisma.chatThread.create({
        data: {
            noteId,
            patientId,
            authorCarerId,
            title,
            isResolved: false
        }
    });

    // Notify carer that a discussion has started
    await createInAppNotification(
        authorCarerId, 
        NOTIFICATION_TEMPLATES.THREAD_CREATED_TITLE, 
        NOTIFICATION_TEMPLATES.THREAD_CREATED_BODY("A patient", note.text), 
        {
            threadId: thread.id,
            type: NOTIFICATION_TYPES.THREAD_CREATED
        }
    );

    return { success: true, thread };
};

export const resolveThread = async (threadId: string) => {
    // Permanent deletion as requested by user
    await prisma.chatThread.delete({
        where: { id: threadId }
    });
    return { success: true };
};

export const getOrCreateDirectChat = async (patientId: string, carerId: string) => {
    let chat = await prisma.directChat.findUnique({
        where: {
            patientId_carerId: { patientId, carerId }
        }
    });

    if (!chat) {
        chat = await prisma.directChat.create({
            data: { patientId, carerId }
        });
    }

    return { success: true, chat };
};

const sendChatMessageNotification = async (params: {
    message: any;
    recipientId: string;
    chatId: string;
    chatType: "thread" | "direct";
    title?: string;
}) => {
    const { message, recipientId, chatId, chatType, title } = params;
    const io = getIO();

    // Trigger Push Notification
    sendChatPushNotificationAction({
        messageId: message.id,
        senderName: message.sender.name || "Someone",
        content: message.content,
        recipientId,
        chatId,
        chatType
    }).catch(err => 
        console.error("[ChatService] Failed to trigger push notification:", err)
    );

    // Diagnostic Log
    (async () => {
        const isCarerRecipient = chatType === "direct" 
            ? (await prisma.directChat.findUnique({ where: { id: chatId } }))?.carerId === recipientId
            : (await prisma.chatThread.findUnique({ where: { id: chatId } }))?.authorCarerId === recipientId;

        const profile = isCarerRecipient
            ? await prisma.profileCarer.findUnique({ where: { id: recipientId } })
            : await prisma.profilePatient.findUnique({ where: { id: recipientId } });
        console.log(`[ChatService] Sending ${chatType} message to ${recipientId}. Profile Token exists: ${!!profile?.pushToken}`);
    })();

    const words = message.content.split(' ');
    const truncatedBody = words.length > 5 
        ? words.slice(0, 5).join(' ') + "..." 
        : message.content;

    const unreadPayload = chatType === "direct" ? { directChatId: chatId } : { threadId: chatId };
    io.to(recipientId).emit("unread_update", unreadPayload);
    
    io.to(recipientId).emit("new_notification", { 
        type: NOTIFICATION_TYPES.CHAT_MESSAGE,
        title: chatType === "direct" 
            ? NOTIFICATION_TEMPLATES.DIRECT_MESSAGE_TITLE(message.sender.name) 
            : NOTIFICATION_TEMPLATES.THREAD_MESSAGE_TITLE(title || "Care Conversation"),
        body: truncatedBody,
        data: { chatId, type: chatType, title: title }
    });

    console.log(`[Socket] EMITTED notification to: ${recipientId}`);
};

export const sendMessage = async (data: {
    senderId: string;
    content: string;
    threadId?: string;
    directChatId?: string;
}) => {
    const message = await prisma.chatMessage.create({
        data: {
            senderId: data.senderId,
            content: data.content,
            threadId: data.threadId,
            directChatId: data.directChatId
        },
        include: {
            sender: {
                select: { name: true, role: true }
            }
        }
    });

    // Emit via Socket.io for real-time delivery
    try {
        const io = getIO();
        const roomId = data.threadId || data.directChatId;
        if (roomId) {
            io.to(roomId).emit("new_message", message);
            console.log(`[Socket] Emitted new_message to room: ${roomId}`);

            if (data.directChatId) {
                const chat = await prisma.directChat.findUnique({ where: { id: data.directChatId } });
                if (chat) {
                    const patientUser = await prisma.profilePatient.findUnique({ where: { id: chat.patientId } });
                    const isPatientSender = patientUser?.userId === data.senderId;
                    const recipientId = isPatientSender ? chat.carerId : chat.patientId;

                    await sendChatMessageNotification({
                        message,
                        recipientId,
                        chatId: data.directChatId,
                        chatType: "direct"
                    });
                }
            } else if (data.threadId) {
                const thread = await prisma.chatThread.findUnique({ where: { id: data.threadId } });
                if (thread) {
                    const patientUser = await prisma.profilePatient.findUnique({ where: { id: thread.patientId } });
                    const isPatientSender = patientUser?.userId === data.senderId;
                    const recipientId = isPatientSender ? thread.authorCarerId : thread.patientId;

                    await sendChatMessageNotification({
                        message,
                        recipientId,
                        chatId: data.threadId,
                        chatType: "thread",
                        title: thread.title
                    });
                }
            }
        }
    } catch (err) {
        console.warn("[Socket] Failed to emit message:", err);
    }

    return { success: true, message };
};

export const getTotalUnreadCount = async (profileId: string, isCarer: boolean) => {
    // Resolve which USER ID corresponds to this PROFILE ID
    let userId = "";
    if (isCarer) {
        const profile = await prisma.profileCarer.findUnique({ where: { id: profileId } });
        userId = profile?.userId || "";
    } else {
        const profile = await prisma.profilePatient.findUnique({ where: { id: profileId } });
        userId = profile?.userId || "";
    }

    // Collect unread counts from all direct chats and threads
    let total = 0;

    // Direct Chats
    const directChats = await prisma.directChat.findMany({
        where: isCarer ? { carerId: profileId } : { patientId: profileId },
    });

    // Due to Prisma's filter complexity on related model fields, we fetch and sum
    for (const chat of directChats) {
        const lastRead = isCarer ? (chat as any).carerLastReadAt : (chat as any).patientLastReadAt;
        const count = await prisma.chatMessage.count({
            where: {
                directChatId: chat.id,
                senderId: { not: userId }, // Compare with User ID
                createdAt: { gt: lastRead }
            }
        });
        total += count;
    }

    // Threads
    const threads = await prisma.chatThread.findMany({
        where: isCarer ? { authorCarerId: profileId } : { patientId: profileId },
    });

    for (const thread of threads) {
        const lastRead = isCarer ? (thread as any).carerLastReadAt : (thread as any).patientLastReadAt;
        const count = await prisma.chatMessage.count({
            where: {
                threadId: thread.id,
                senderId: { not: profileId },
                createdAt: { gt: lastRead }
            }
        });
        total += count;
    }

    return { success: true, total };
};

export const markAsRead = async (chatId: string, type: "thread" | "direct", profileId: string, isCarer: boolean) => {
    if (type === "direct") {
        await prisma.directChat.update({
            where: { id: chatId },
            data: (isCarer ? { carerLastReadAt: new Date() } : { patientLastReadAt: new Date() }) as any
        });
    } else {
        await prisma.chatThread.update({
            where: { id: chatId },
            data: (isCarer ? { carerLastReadAt: new Date() } : { patientLastReadAt: new Date() }) as any
        });
    }
    return { success: true };
};
export const getMessages = async (threadId?: string, directChatId?: string) => {
    const messages = await prisma.chatMessage.findMany({
        where: {
            OR: [
                { threadId: threadId || undefined },
                { directChatId: directChatId || undefined }
            ]
        },
        orderBy: { createdAt: "asc" },
        include: {
            sender: {
                select: { name: true, role: true }
            }
        }
    });

    return { success: true, messages };
};
