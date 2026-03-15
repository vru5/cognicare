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
