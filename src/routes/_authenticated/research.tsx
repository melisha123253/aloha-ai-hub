import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BookOpenCheck, Sparkle } from "lucide-react";
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
import { generateResearch } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace AI" },
      {
        name: "description",
        content: "Summarise topics or articles into key insights, recommendations and questions.",
      },
      { property: "og:title", content: "AI Research Assistant — Workplace AI" },
      {
        property: "og:description",
        content: "Paste an article or name a topic and get a structured workplace research brief.",
      },
    ],
  }),
  component: ResearchTool,
});

type ResearchInput = {
  topic: string;
  audience: string;
  depth: "Quick brief" | "Standard" | "Deep dive";
};

function ResearchTool() {
  const generate = useServerFn(generateResearch);
  const [form, setForm] = useState<ResearchInput>({
    topic: "",
    audience: "workplace team",
    depth: "Standard",
  });

  const tool = useToolGeneration<ResearchInput>({
    tool: "research",
    generate,
    buildTitle: (input) => `Research: ${input.topic.slice(0, 80)}`,
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.topic.trim()) return;
    void tool.run(form);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="AI Research Assistant"
        description="Summaries, insights and recommendations"
        icon={BookOpenCheck}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <form onSubmit={submit} className="glass flex flex-col gap-4 rounded-3xl p-5">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic or article text</Label>
            <Textarea
              id="topic"
              required
              rows={10}
              maxLength={8000}
              value={form.topic}
              onChange={(event) => setForm({ ...form, topic: event.target.value })}
              placeholder="Paste an article, or describe a topic such as 'hybrid meeting best practices'."
              className="rounded-2xl bg-background/50"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="audience">Audience</Label>
              <Input
                id="audience"
                value={form.audience}
                maxLength={200}
                onChange={(event) => setForm({ ...form, audience: event.target.value })}
                className="rounded-2xl bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Depth</Label>
              <Select
                value={form.depth}
                onValueChange={(value) =>
                  setForm({ ...form, depth: value as ResearchInput["depth"] })
                }
              >
                <SelectTrigger className="rounded-2xl bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Quick brief">Quick brief</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Deep dive">Deep dive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="rounded-2xl" disabled={tool.isGenerating}>
            <Sparkle />
            {tool.isGenerating ? "Researching…" : "Summarise"}
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