import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for testing

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBroadcast(userId: string) {
  console.log(`[Test] Sending test broadcast to user: ${userId}`);
  
  const channel = supabase.channel(`user_notifications:${userId}`);
  
  // Wait a moment for connection
  await new Promise(r => setTimeout(r, 1000));

  const result = await channel.send({
    type: "broadcast",
    event: "new_notification",
    payload: {
      id: "test-notification-id",
      title: "Test Notification 🚀",
      body: "If you see this, your Realtime subscription is working perfectly!",
      data: { test: true },
      createdAt: new Date().toISOString()
    }
  });

  console.log("[Test] Broadcast result:", result);
  process.exit(0);
}

// Get userId from command line or use a default
const targetUserId = process.argv[2] || "cm7pm9uog0000uxps30r9qnh2";
testBroadcast(targetUserId);
