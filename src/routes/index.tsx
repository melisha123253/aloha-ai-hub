import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenCheck, CalendarClock, Mail, Waves } from "lucide-react";

import dolphin from "@/assets/dolphin.png";
import fishPalm from "@/assets/fish-palm.png";
import hero from "@/assets/hero-ocean.jpg";
import turtle from "@/assets/turtle.png";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workplace AI — AI Productivity Assistant for Teams" },
      {
        name: "description",
        content:
          "Draft emails, plan your week, summarise research and chat with a workplace AI assistant — all in one tropical, calm hub.",
      },
      { property: "og:title", content: "Workplace AI — AI Productivity Assistant" },
      {
        property: "og:description",
        content:
          "An AI hub for everyone: smart emails, task planning, research briefs and a workplace chat assistant.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Mail,
    title: "Smart Email Generator",
    body: "Formal, friendly or persuasive — describe the goal and edit the draft.",
  },
  {
    icon: CalendarClock,
    title: "AI Task Planner",
    body: "Prioritised daily and weekly schedules built around your working hours.",
  },
  {
    icon: BookOpenCheck,
    title: "Research Assistant",
    body: "Summaries with key insights, recommendations and open questions.",
  },
  {
    icon: Waves,
    title: "Chat Assistant",
    body: "A threaded workplace chatbot for wording, process and prioritisation.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-5">
        <Brand />
        <div className="min-w-0 flex-1" />
        <ThemeToggle />
        <Button asChild className="shrink-0 rounded-2xl">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16">
        <section className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-10">
          <img
            src={hero}
            alt="Turquoise tropical lagoon at golden hour"
            className="absolute inset-0 size-full object-cover opacity-25"
          />
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              An AI hub for everyone
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">
              Automate the busywork.{" "}
              <span className="text-tropical">Keep the island calm.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Workplace AI turns everyday tasks — emails, plans, research and questions — into
              editable AI drafts you can copy, save and reuse.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-2xl">
                <Link to="/auth">Get started free</Link>
              </Button>
            </div>
          </div>
          <img
            src={turtle}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-8 right-2 w-40 opacity-80 sm:w-64"
          />
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article key={feature.title} className="glass flex flex-col gap-3 rounded-3xl p-5">
              <span
                className="grid size-11 place-items-center rounded-2xl text-primary-foreground"
                style={{ backgroundImage: "var(--gradient-tropical)" }}
              >
                <feature.icon className="size-5" />
              </span>
              <h2 className="font-display text-sm font-semibold">{feature.title}</h2>
              <p className="text-xs leading-relaxed text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </section>

        <section className="glass mt-8 grid items-center gap-6 rounded-3xl p-6 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">Saved Projects keep every draft</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Save any AI output with a title, filter by tool, and copy it back into your workflow
              whenever you need it. Dark and light modes included.
            </p>
            <AiDisclaimer className="mt-4" />
          </div>
          <div className="flex shrink-0 items-end gap-3">
            <img src={dolphin} alt="" aria-hidden="true" className="w-28 opacity-80" />
            <img src={fishPalm} alt="" aria-hidden="true" className="w-24 opacity-80" />
          </div>
        </section>
      </main>
    </div>
  );
}
