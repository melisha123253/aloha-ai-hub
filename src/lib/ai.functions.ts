import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const emailSchema = z.object({
  recipient: z.string().trim().max(120).default(""),
  goal: z.string().trim().min(1, "Describe what the email should achieve").max(600),
  keyPoints: z.string().trim().max(2000).default(""),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
  length: z.enum(["Short", "Medium", "Detailed"]),
});

const plannerSchema = z.object({
  tasks: z.string().trim().min(1, "List at least one task").max(3000),
  timeframe: z.enum(["Daily", "Weekly"]),
  workingHours: z.string().trim().max(120).default("9:00 - 17:00"),
  focus: z.string().trim().max(600).default(""),
});

const researchSchema = z.object({
  topic: z.string().trim().min(1, "Enter a topic or paste an article").max(8000),
  audience: z.string().trim().max(200).default("workplace team"),
  depth: z.enum(["Quick brief", "Standard", "Deep dive"]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => emailSchema.parse(input))
  .handler(async ({ data }) => {
    const { runPrompt } = await import("./ai.server");
    return runPrompt({
      system:
        "You are an expert workplace communication assistant. Write clear, well-structured professional emails in markdown. Always include a subject line as the first line prefixed with 'Subject:'.",
      prompt: [
        `Tone: ${data.tone}`,
        `Length: ${data.length}`,
        data.recipient ? `Recipient: ${data.recipient}` : "",
        `Goal of the email: ${data.goal}`,
        data.keyPoints ? `Key points to include:\n${data.keyPoints}` : "",
        "Write the complete email, ready to send.",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  });

export const generatePlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => plannerSchema.parse(input))
  .handler(async ({ data }) => {
    const { runPrompt } = await import("./ai.server");
    return runPrompt({
      system:
        "You are a productivity planning assistant. Produce realistic, prioritised schedules in markdown using tables or time-blocked lists. Prioritise with High/Medium/Low labels and call out risks at the end.",
      prompt: [
        `Plan type: ${data.timeframe} schedule`,
        `Working hours: ${data.workingHours}`,
        data.focus ? `Priorities and constraints: ${data.focus}` : "",
        `Tasks:\n${data.tasks}`,
        "Return a prioritised schedule with time blocks, a priority ranking, and a short list of suggestions.",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  });

export const generateResearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => researchSchema.parse(input))
  .handler(async ({ data }) => {
    const { runPrompt } = await import("./ai.server");
    return runPrompt({
      system:
        "You are a workplace research assistant. Summarise topics or pasted articles in markdown with these sections: Summary, Key Insights, Recommendations, Open Questions. Be concrete and avoid inventing statistics or citations.",
      prompt: [
        `Depth: ${data.depth}`,
        `Audience: ${data.audience}`,
        `Topic or source material:\n${data.topic}`,
      ].join("\n"),
    });
  });