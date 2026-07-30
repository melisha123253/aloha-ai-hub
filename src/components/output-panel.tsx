import { Check, Copy, Eye, PencilLine, RefreshCw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function OutputPanel({
  output,
  onOutputChange,
  title,
  onTitleChange,
  onSave,
  onRegenerate,
  isSaving,
  isGenerating,
}: {
  output: string;
  onOutputChange: (value: string) => void;
  title: string;
  onTitleChange: (value: string) => void;
  onSave: () => void;
  onRegenerate: () => void;
  isSaving: boolean;
  isGenerating: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy — select the text and copy manually.");
    }
  };

  return (
    <section className="glass flex flex-col gap-4 rounded-3xl p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Generated result</h2>
          <p className="text-xs text-muted-foreground">Edit freely before saving or sending.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 rounded-full"
          onClick={() => setPreview((value) => !value)}
        >
          {preview ? <PencilLine /> : <Eye />}
          {preview ? "Edit" : "Preview"}
        </Button>
      </div>

      {preview ? (
        <div className="md rounded-2xl bg-background/40 p-4 text-sm">
          <ReactMarkdown>{output || "_Nothing generated yet._"}</ReactMarkdown>
        </div>
      ) : (
        <Textarea
          value={output}
          onChange={(event) => onOutputChange(event.target.value)}
          rows={16}
          className="resize-y rounded-2xl bg-background/50 font-mono text-sm leading-relaxed"
          placeholder="Your AI-generated result will appear here."
        />
      )}

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Title for Saved Projects"
          maxLength={160}
          className="rounded-2xl bg-background/50"
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-2xl" onClick={copy} disabled={!output}>
            {copied ? <Check /> : <Copy />}
            Copy
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={onRegenerate}
            disabled={isGenerating}
          >
            <RefreshCw className={isGenerating ? "animate-spin" : undefined} />
            Regenerate
          </Button>
          <Button className="rounded-2xl" onClick={onSave} disabled={!output || isSaving}>
            <Save />
            Save
          </Button>
        </div>
      </div>

      <AiDisclaimer />
    </section>
  );
}