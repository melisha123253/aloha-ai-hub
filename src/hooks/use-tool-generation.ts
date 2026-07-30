import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { saveProject, type ToolId } from "@/lib/projects.functions";

export function useToolGeneration<TInput extends Record<string, unknown>>({
  tool,
  generate,
  buildTitle,
}: {
  tool: ToolId;
  generate: (args: { data: TInput }) => Promise<{ text: string }>;
  buildTitle: (input: TInput) => string;
}) {
  const save = useServerFn(saveProject);
  const queryClient = useQueryClient();
  const [output, setOutput] = useState("");
  const [title, setTitle] = useState("");
  const [lastInput, setLastInput] = useState<TInput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const run = async (input: TInput) => {
    setIsGenerating(true);
    try {
      const result = await generate({ data: input });
      setOutput(result.text);
      setLastInput(input);
      setTitle((current) => current || buildTitle(input).slice(0, 120));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerate = (fallback?: TInput) => {
    const input = lastInput ?? fallback;
    if (!input) {
      toast.error("Fill in the form and generate first.");
      return;
    }
    void run(input);
  };

  const persist = async () => {
    if (!output.trim()) return;
    setIsSaving(true);
    try {
      await save({
        data: {
          tool,
          title: title.trim() || `${tool} draft`,
          input: (lastInput ?? {}) as Record<string, unknown>,
          output,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Saved to your projects");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    output,
    setOutput,
    title,
    setTitle,
    isGenerating,
    isSaving,
    run,
    regenerate,
    persist,
  };
}