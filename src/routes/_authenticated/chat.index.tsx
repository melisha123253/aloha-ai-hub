import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { toast } from "sonner";

import { Shimmer } from "@/components/ai-elements/shimmer";
import { createThread, listThreads } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: ChatEntry,
});

function ChatEntry() {
  const navigate = useNavigate();
  const fetchThreads = useServerFn(listThreads);
  const addThread = useServerFn(createThread);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const threads = await fetchThreads();
        const target = threads[0] ?? (await addThread());
        if (!cancelled) {
          navigate({
            to: "/chat/$threadId",
            params: { threadId: target.id },
            replace: true,
          });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not open chat");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [addThread, fetchThreads, navigate]);

  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Shimmer>Opening your conversation…</Shimmer>
    </div>
  );
}