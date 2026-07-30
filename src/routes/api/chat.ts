import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import {
  CHAT_MODEL,
  createLovableAiGatewayProvider,
  getLovableAiGatewayRunId,
  requireLovableApiKey,
} from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are the AI Workplace Productivity Assistant — a warm, practical assistant for everyday work tasks: emails, planning, prioritisation, meetings, research and process questions.
Answer in markdown, keep responses focused and actionable, and use short lists when they help.
Never invent facts, numbers, policies or citations. When something depends on company specifics, say so and ask a clarifying question.`;

type ChatBody = { messages?: unknown; threadId?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        const messages = body.messages;
        const threadId = typeof body.threadId === "string" ? body.threadId : null;

        if (!Array.isArray(messages) || !threadId) {
          return new Response("messages and threadId are required", { status: 400 });
        }

        const authHeader = request.headers.get("authorization") ?? "";
        if (!authHeader.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { createChatSupabaseClient } = await import("@/lib/chat.server");
        const auth = await createChatSupabaseClient(authHeader.slice(7));
        if (!auth) return new Response("Unauthorized", { status: 401 });
        const { supabase, userId } = auth;

        const { data: thread } = await supabase
          .from("chat_threads")
          .select("id, title")
          .eq("id", threadId)
          .eq("user_id", userId)
          .maybeSingle();
        if (!thread) return new Response("Conversation not found", { status: 404 });

        const uiMessages = messages as UIMessage[];
        const lastUserMessage = [...uiMessages].reverse().find((m) => m.role === "user");

        const { persistMessage, touchThread } = await import("@/lib/chat.server");
        if (lastUserMessage) {
          await persistMessage(supabase, userId, threadId, lastUserMessage);
          if (thread.title === "New conversation") {
            const text = lastUserMessage.parts
              .map((part) => ("text" in part && typeof part.text === "string" ? part.text : ""))
              .join(" ")
              .trim();
            if (text) {
              await supabase
                .from("chat_threads")
                .update({ title: text.slice(0, 60) })
                .eq("id", threadId)
                .eq("user_id", userId);
            }
          }
        }

        try {
          const initialRunId = getLovableAiGatewayRunId(request);
          const gateway = createLovableAiGatewayProvider(requireLovableApiKey(), initialRunId);
          const result = streamText({
            model: gateway(CHAT_MODEL),
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(uiMessages),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: uiMessages,
            onFinish: async ({ responseMessage }) => {
              try {
                await persistMessage(supabase, userId, threadId, responseMessage);
                await touchThread(supabase, userId, threadId);
              } catch (error) {
                console.error("[chat] failed to persist assistant message", error);
              }
            },
          });
        } catch (error) {
          console.error("[chat] stream failed", error);
          const { describeAiError } = await import("@/lib/ai-gateway.server");
          return new Response(describeAiError(error), { status: 500 });
        }
      },
    },
  },
});