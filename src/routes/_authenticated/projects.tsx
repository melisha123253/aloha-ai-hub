import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, FolderHeart, Trash2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { deleteProject, listProjects } from "@/lib/projects.functions";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({
    meta: [
      { title: "Saved Projects — Workplace AI" },
      {
        name: "description",
        content: "Every AI email, plan and research brief you saved, in one place.",
      },
      { property: "og:title", content: "Saved Projects — Workplace AI" },
      {
        property: "og:description",
        content: "Revisit, copy and manage your saved AI-generated workplace output.",
      },
    ],
  }),
  component: ProjectsPage,
});

const TOOL_LABELS: Record<string, string> = {
  email: "Email",
  planner: "Planner",
  research: "Research",
  chat: "Chat",
};

const FILTERS = ["all", "email", "planner", "research"] as const;

function ProjectsPage() {
  const fetchProjects = useServerFn(listProjects);
  const removeProject = useServerFn(deleteProject);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchProjects(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeProject({ data: { id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Deleted");
    },
    onError: (error: Error) => toast.error(error.message || "Could not delete"),
  });

  const visible = filter === "all" ? projects : projects.filter((p) => p.tool === filter);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        title="Saved Projects"
        description="Your previous AI output, ready to reuse"
        icon={FolderHeart}
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <Button
            key={value}
            size="sm"
            variant={filter === value ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setFilter(value)}
          >
            {value === "all" ? "All" : TOOL_LABELS[value]}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading your saved work…</p>
      ) : visible.length === 0 ? (
        <div className="glass rounded-3xl p-6 text-sm text-muted-foreground">
          Nothing here yet. Generate something in the email, planner or research tool and press
          Save.
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((project) => {
            const isOpen = openId === project.id;
            return (
              <li key={project.id} className="glass rounded-3xl p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : project.id)}
                    className="min-w-0 text-left"
                  >
                    <p className="truncate text-sm font-medium">{project.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {TOOL_LABELS[project.tool] ?? project.tool} ·{" "}
                      {new Date(project.created_at).toLocaleString()}
                    </p>
                  </button>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Copy output"
                      className="rounded-full"
                      onClick={() => void copy(project.id, project.output ?? "")}
                    >
                      {copiedId === project.id ? (
                        <Check className="size-4" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete project"
                      className="rounded-full text-muted-foreground"
                      onClick={() => remove.mutate(project.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                {isOpen && (
                  <div className="md mt-3 rounded-2xl bg-background/40 p-4 text-sm">
                    <ReactMarkdown>{project.output || "_Empty_"}</ReactMarkdown>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <AiDisclaimer />
    </div>
  );
}