import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BookOpenCheck,
  CalendarClock,
  FolderHeart,
  LayoutDashboard,
  Mail,
  Sparkle,
  Waves,
} from "lucide-react";

import dolphin from "@/assets/dolphin.png";
import fishPalm from "@/assets/fish-palm.png";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { listProjects } from "@/lib/projects.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Workplace AI Productivity Assistant" },
      {
        name: "description",
        content: "Your productivity overview with quick actions for emails, plans and research.",
      },
      { property: "og:title", content: "Dashboard — Workplace AI" },
      {
        property: "og:description",
        content: "See saved AI work and jump into the email, planner, research and chat tools.",
      },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  {
    title: "Smart Email",
    description: "Draft a professional email in a formal, friendly or persuasive tone.",
    url: "/email",
    icon: Mail,
  },
  {
    title: "Task Planner",
    description: "Turn a messy task list into a prioritised daily or weekly schedule.",
    url: "/planner",
    icon: CalendarClock,
  },
  {
    title: "Research Assistant",
    description: "Summarise a topic or article into insights and recommendations.",
    url: "/research",
    icon: BookOpenCheck,
  },
  {
    title: "Chat Assistant",
    description: "Ask anything about workflows, meetings, wording or prioritisation.",
    url: "/chat",
    icon: Waves,
  },
] as const;

const TOOL_LABELS: Record<string, string> = {
  email: "Email",
  planner: "Planner",
  research: "Research",
  chat: "Chat",
};

function Dashboard() {
  const fetchProjects = useServerFn(listProjects);
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchProjects(),
  });

  const counts = projects.reduce<Record<string, number>>((acc, project) => {
    acc[project.tool] = (acc[project.tool] ?? 0) + 1;
    return acc;
  }, {});

  const recent = projects.slice(0, 4);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Productivity overview"
        description="Your AI hub for everyday workplace tasks"
        icon={LayoutDashboard}
        action={
          <Button asChild className="shrink-0 rounded-2xl">
            <Link to="/email">
              <Sparkle />
              New draft
            </Link>
          </Button>
        }
      />

      <section className="glass relative overflow-hidden rounded-3xl p-6">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-xl font-semibold">
            Aloha — <span className="text-tropical">let&apos;s clear your desk</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Generate, edit and save AI output for the work you repeat every week. Everything you
            keep lands in Saved Projects.
          </p>
        </div>
        <img
          src={dolphin}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="pointer-events-none absolute -bottom-6 right-2 w-40 opacity-70 sm:w-52"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.url}
            to={action.url}
            className="glass group flex flex-col gap-3 rounded-3xl p-5 transition-transform hover:-translate-y-0.5"
          >
            <span
              className="grid size-11 place-items-center rounded-2xl text-primary-foreground"
              style={{ backgroundImage: "var(--gradient-tropical)" }}
            >
              <action.icon className="size-5" />
            </span>
            <span className="font-display text-sm font-semibold">{action.title}</span>
            <span className="text-xs leading-relaxed text-muted-foreground">
              {action.description}
            </span>
            <span className="mt-auto text-xs text-muted-foreground">
              {counts[action.url.slice(1)] ?? 0} saved
            </span>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="glass rounded-3xl p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="truncate text-base font-semibold">Recent AI output</h2>
            <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
              <Link to="/projects">
                <FolderHeart />
                View all
              </Link>
            </Button>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Nothing saved yet. Generate something with one of the tools above and hit Save.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recent.map((project) => (
                <li
                  key={project.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-background/40 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{project.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {TOOL_LABELS[project.tool] ?? project.tool} ·{" "}
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="shrink-0 rounded-full">
                    <Link to="/projects">Open</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass relative flex flex-col gap-3 overflow-hidden rounded-3xl p-5">
          <h2 className="text-base font-semibold">Responsible AI</h2>
          <AiDisclaimer />
          <img
            src={fishPalm}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="pointer-events-none mx-auto w-32 opacity-70"
          />
        </div>
      </section>
    </div>
  );
}