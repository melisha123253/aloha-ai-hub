import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Sparkle } from "lucide-react";
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
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workplace AI" },
      {
        name: "description",
        content: "Generate professional workplace emails in formal, friendly or persuasive tones.",
      },
      { property: "og:title", content: "Smart Email Generator — Workplace AI" },
      {
        property: "og:description",
        content: "Describe your goal and get an editable, ready-to-send professional email.",
      },
    ],
  }),
  component: EmailTool,
});

type EmailInput = {
  recipient: string;
  goal: string;
  keyPoints: string;
  tone: "Formal" | "Friendly" | "Persuasive";
  length: "Short" | "Medium" | "Detailed";
};

function EmailTool() {
  const generate = useServerFn(generateEmail);
  const [form, setForm] = useState<EmailInput>({
    recipient: "",
    goal: "",
    keyPoints: "",
    tone: "Formal",
    length: "Medium",
  });

  const tool = useToolGeneration<EmailInput>({
    tool: "email",
    generate,
    buildTitle: (input) => `Email: ${input.goal}`,
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.goal.trim()) return;
    void tool.run(form);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Smart Email Generator"
        description="Professional emails in the tone you need"
        icon={Mail}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <form onSubmit={submit} className="glass flex flex-col gap-4 rounded-3xl p-5">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient (optional)</Label>
            <Input
              id="recipient"
              value={form.recipient}
              maxLength={120}
              onChange={(event) => setForm({ ...form, recipient: event.target.value })}
              placeholder="Head of Operations"
              className="rounded-2xl bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal">What should this email achieve?</Label>
            <Textarea
              id="goal"
              required
              rows={3}
              maxLength={600}
              value={form.goal}
              onChange={(event) => setForm({ ...form, goal: event.target.value })}
              placeholder="Ask for a two-week extension on the Q3 report and propose a new date."
              className="rounded-2xl bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keyPoints">Key points (optional)</Label>
            <Textarea
              id="keyPoints"
              rows={4}
              maxLength={2000}
              value={form.keyPoints}
              onChange={(event) => setForm({ ...form, keyPoints: event.target.value })}
              placeholder="Data pending from finance; draft ready Friday; happy to share an interim summary."
              className="rounded-2xl bg-background/50"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select
                value={form.tone}
                onValueChange={(value) => setForm({ ...form, tone: value as EmailInput["tone"] })}
              >
                <SelectTrigger className="rounded-2xl bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Friendly">Friendly</SelectItem>
                  <SelectItem value="Persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Length</Label>
              <Select
                value={form.length}
                onValueChange={(value) =>
                  setForm({ ...form, length: value as EmailInput["length"] })
                }
              >
                <SelectTrigger className="rounded-2xl bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Short">Short</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="rounded-2xl" disabled={tool.isGenerating}>
            <Sparkle />
            {tool.isGenerating ? "Writing…" : "Generate email"}
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