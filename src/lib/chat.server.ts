import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { UIMessage } from "ai";

import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

function supabaseFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(init?.headers);
    if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

export async function createChatSupabaseClient(token: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing backend configuration");

  const supabase = createClient<Database>(url, key, {
    global: {
      fetch: supabaseFetch(key),
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId) return null;
  return { supabase, userId };
}

export async function persistMessage(
  supabase: Client,
  userId: string,
  threadId: string,
  message: UIMessage,
) {
  const { error } = await supabase.from("chat_messages").insert({
    thread_id: threadId,
    user_id: userId,
    role: message.role,
    parts: message.parts as never,
    message_id: message.id,
  });
  if (error) console.error("[chat] insert message failed", error.message);
}

export async function touchThread(supabase: Client, userId: string, threadId: string) {
  const { error } = await supabase
    .from("chat_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId)
    .eq("user_id", userId);
  if (error) console.error("[chat] touch thread failed", error.message);
}