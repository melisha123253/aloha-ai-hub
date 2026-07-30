import { generateText } from "ai";

import {
  CHAT_MODEL,
  createLovableAiGatewayProvider,
  describeAiError,
  requireLovableApiKey,
} from "./ai-gateway.server";

export async function runPrompt({ system, prompt }: { system: string; prompt: string }) {
  try {
    const gateway = createLovableAiGatewayProvider(requireLovableApiKey());
    const { text } = await generateText({
      model: gateway(CHAT_MODEL),
      system,
      prompt,
    });
    return { text };
  } catch (error) {
    console.error("[ai] generation failed", error);
    throw new Error(describeAiError(error));
  }
}