import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, Sparkle } from "lucide-react";
import { useState } from "react";

import { OutputPanel } from "@/components/output-panel";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToolGeneration } from "@/hooks/use-tool-generation";
import { generatePlan } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Workplace AI" },
      {
        name: "description",
        content: "Turn a task list into a prioritised daily or weekly schedule with time blocks.",
      },
      { property: "og:title", content: "AI Task Planner — Workplace AI" },
      {
        property: "og:description",
        content: "Prioritise your workload and get a realistic time-blocked plan in seconds.",
      },
    ],
  }),
  component: PlannerTool,
});

type PlannerInput = {
  tasks: string;
  timeframe: "Daily" | "Weekly";
  workingHours: string;
  focus: string;
};

function PlannerTool() {
  const generate = useServerFn(generatePlan);
  const [form, setForm] = useState<PlannerInput>({
    tasks: "",
    timeframe: "Daily",
    workingHours: "9:00 - 17:00",
    focus: "",
  });

  const tool = useToolGeneration<PlannerInput>({
    tool: "planner",
    generate,
    buildTitle: (input) => `${input.timeframe} plan — ${input.tasks.split("\n")[0]}`,
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.tasks.trim()) return;
    void tool.run(form);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="AI Task Planner"
        description="Prioritised daily and weekly schedules"
        icon={CalendarClock}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <form onSubmit={submit} className="glass flex flex-col gap-4 rounded-3xl p-5">
          <div className="space-y-2">
            <Label htmlFor="tasks">Tasks (one per line)</Label>
            <Textarea
              id="tasks"
              required
              rows={8}
              maxLength={3000}
              value={form.tasks}
              onChange={(event) => setForm({ ...form, tasks: event.target.value })}
              placeholder={"Finish Q3 report\nReview two design PRs\nPrep Monday standup\nCall supplier"}
              className="rounded-2xl bg-background/50"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select
                value={form.timeframe}
                onValueChange={(value) =>
                  setForm({ ...form, timeframe: value as PlannerInput["timeframe"] })
                }
              >
                <SelectTrigger className="rounded-2xl bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingHours">Working hours</Label>
              <Input
                id="workingHours"
                value={form.workingHours}
                maxLength={120}
                onChange={(event) => setForm({ ...form, workingHours: event.target.value })}
                className="rounded-2xl bg-background/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="focus">Priorities and constraints (optional)</Label>
            <Textarea
              id="focus"
              rows={3}
              maxLength={600}
              value={form.focus}
              onChange={(event) => setForm({ ...form, focus: event.target.value })}
              placeholder="Report is due Thursday. Keep afternoons free for deep work."
              className="rounded-2xl bg-background/50"
            />
          </div>
          <Button type="submit" className="rounded-2xl" disabled={tool.isGenerating}>
            <Sparkle />
            {tool.isGenerating ? "Planning…" : "Build my plan"}
          </Button>
        </form>

        <OutputPanel
          output={tool.output}
          onOutputChange={tool.setOutput}
          title={tool.title}
          onTitleChange={tool.setTitle}
          onSave={tool.persist}
          onRegenerate={() => tool.regenerate(form)}
          isSaving={tool.isSaving}
          isGenerating={tool.isGenerating}
        />
      </div>
    </div>
  );
}