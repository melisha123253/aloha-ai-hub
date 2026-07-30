import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageSquarePlus, Trash2, Waves } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import logo from "@/assets/logo.png";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  createThread,
  deleteThread,
  getThreadMessages,
  listThreads,
} from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "AI Chat Assistant — Workplace AI" },
      {
        name: "description",
        content: "Chat with a workplace AI assistant about productivity, wording and planning.",
      },
      { property: "og:title", content: "AI Chat Assistant — Workplace AI" },
      {
        property: "og:description",
        content: "Ask workplace productivity questions and keep every conversation in one place.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetchThreads = useServerFn(listThreads);
  const addThread = useServerFn(createThread);
  const removeThread = useServerFn(deleteThread);
  const fetchMessages = useServerFn(getThreadMessages);

  const { data: threads = [] } = useQuery({
    queryKey: ["chat-threads"],
    queryFn: () => fetchThreads(),
  });

  const { data: threadData, isLoading } = useQuery({
    queryKey: ["chat-thread", threadId],
    queryFn: () => fetchMessages({ data: { threadId } }),
  });

  const newThread = async () => {
    try {
      const thread = await addThread();
      await queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: thread.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start a conversation");
    }
  };

  const dropThread = async (id: string) => {
    try {
      await removeThread({ data: { id } });
      const remaining = await queryClient.fetchQuery({
        queryKey: ["chat-threads"],
        queryFn: () => fetchThreads(),
      });
      if (id === threadId) {
        const next = remaining[0] ?? (await addThread());
        await queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
        navigate({ to: "/chat/$threadId", params: { threadId: next.id }, replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete conversation");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="AI Chat Assistant"
        description="Your workplace productivity companion"
        icon={Waves}
        action={
          <Button onClick={newThread} className="shrink-0 rounded-2xl">
            <MessageSquarePlus />
            New chat
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <aside className="glass order-2 max-h-[26rem] overflow-y-auto rounded-3xl p-3 lg:order-1 lg:max-h-[70vh]">
          <h2 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Conversations
          </h2>
          <ul className="space-y-1">
            {threads.map((thread) => (
              <li
                key={thread.id}
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1 rounded-2xl px-2 py-1.5",
                  thread.id === threadId ? "bg-primary/15" : "hover:bg-muted/60",
                )}
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate({ to: "/chat/$threadId", params: { threadId: thread.id } })
                  }
                  className="min-w-0 truncate text-left text-sm"
                >
                  {thread.title}
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${thread.title}`}
                  onClick={() => void dropThread(thread.id)}
                  className="shrink-0 rounded-full text-muted-foreground"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="order-1 lg:order-2">
          {isLoading ? (
            <div className="glass grid h-[60vh] place-items-center rounded-3xl">
              <Shimmer>Loading conversation…</Shimmer>
            </div>
          ) : (
            <ChatWindow
              key={threadId}
              threadId={threadId}
              initialMessages={(threadData?.messages ?? []) as unknown as UIMessage[]}
              onTurnComplete={() =>
                queryClient.invalidateQueries({ queryKey: ["chat-threads"] })
              }
            />
          )}
          <AiDisclaimer className="mt-3" />
        </div>
      </div>
    </div>
  );
}

function ChatWindow({
  threadId,
  initialMessages,
  onTurnComplete,
}: {
  threadId: string;
  initialMessages: UIMessage[];
  onTurnComplete: () => void;
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          return data.session?.access_token
            ? { Authorization: `Bearer ${data.session.access_token}` }
            : {};
        },
        body: { threadId },
      }),
    [threadId],
  );

  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (error) => toast.error(error.message || "The assistant could not reply"),
    onFinish: onTurnComplete,
  });

  useEffect(() => {
    if (status === "ready") textareaRef.current?.focus();
  }, [status, threadId]);

  const submit = (message: { text?: string }) => {
    const text = (message.text ?? input).trim();
    if (!text || status === "submitted" || status === "streaming") return;
    setInput("");
    void sendMessage({ text });
  };

  return (
    <section className="glass flex h-[60vh] min-h-[26rem] flex-col rounded-3xl p-3 sm:p-4">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="gap-4">
          {messages.length === 0 && (
            <ConversationEmptyState
              icon={
                <img src={logo} alt="" aria-hidden="true" className="size-12" />
              }
              title="Ask me anything about your work"
              description="Try: “Help me prioritise five overdue tasks” or “Rewrite this message to sound calmer”."
            />
          )}
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.parts.map((part, index) =>
                  part.type === "text" ? (
                    <MessageResponse key={index}>{part.text}</MessageResponse>
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && <Shimmer>Thinking…</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={submit} className="mt-3">
        <PromptInputTextarea
          ref={textareaRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about emails, planning, meetings or prioritisation…"
        />
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit status={status} onStop={stop} disabled={!input.trim()} />
        </PromptInputFooter>
      </PromptInput>
    </section>
  );
}