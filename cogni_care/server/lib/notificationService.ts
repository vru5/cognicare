import { prisma } from "./prisma.js";

export async function sendPushNotificationAction(commentId: string) {
  const edgeFunctionUrl = process.env.SUPABASE_EDGE_FUNCTION_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!edgeFunctionUrl || !serviceRoleKey) {
    console.warn(
      "[NotificationService] Missing SUPABASE_EDGE_FUNCTION_URL or SUPABASE_SERVICE_ROLE_KEY. Skipping notification.",
    );
    return { success: false, error: "Notification service not configured" };
  }

  console.log(
    `[NotificationService] Triggering Supabase Edge Function for comment ${commentId}`,
  );

  try {
    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ note_id: commentId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[NotificationService] Edge Function error: ${response.status} ${errorText}`,
      );
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    console.error(
      "[NotificationService] Failed to trigger Edge Function:",
      error,
    );
    return { success: false, error: "Network error" };
  }
}


export async function sendChatPushNotificationAction(data: {
  messageId: string;
  senderName: string;
  content: string;
  recipientId: string;
  chatId: string;
  chatType: "direct" | "thread";
}) {
  const edgeFunctionUrl = process.env.SUPABASE_CHAT_EDGE_FUNCTION_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!edgeFunctionUrl || !serviceRoleKey) {
    console.warn(
      "[NotificationService] Missing SUPABASE_CHAT_EDGE_FUNCTION_URL or SUPABASE_SERVICE_ROLE_KEY. Skipping chat notification.",
    );
    return { success: false, error: "Notification service not configured" };
  }

  console.log(
    `[NotificationService] Attempting to trigger Chat Edge Function for message ${data.messageId}`,
    `URL: ${edgeFunctionUrl}`
  );

  try {
    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        message_id: data.messageId,
        sender_name: data.senderName,
        content: data.content,
        recipient_id: data.recipientId,
        chat_id: data.chatId,
        chat_type: data.chatType,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[NotificationService] Chat Edge Function FAILED: ${response.status} ${errorText}`
      );
      return { success: false, error: errorText };
    }

    const resData = await response.json();
    console.log(`[NotificationService] Chat Edge Function SUCCESS:`, resData);
    return { success: true };
  } catch (error) {
    console.error(
      "[NotificationService] Chat Edge Function NETWORK ERROR:",
      error
    );
    return { success: false, error: "Network error" };
  }
}


export async function createInAppNotification(userId: string, title: string, body: string, data: any = {}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        body,
        data: JSON.stringify(data),
      }
    });
    return { success: true, notification };
  } catch (error) {
    console.error("[NotificationService] Failed to create in-app notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
}
