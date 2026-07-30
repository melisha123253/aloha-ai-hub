import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const TOOLS = ["email", "planner", "research", "chat"] as const;
export type ToolId = (typeof TOOLS)[number];

const saveSchema = z.object({
  id: z.string().uuid().optional(),
  tool: z.enum(TOOLS),
  title: z.string().trim().min(1).max(160),
  input: z.record(z.any()).default({}),
  output: z.string().max(40000).default(""),
});

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_projects")
      .select("id, tool, title, input, output, created_at, updated_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (data.id) {
      const { data: row, error } = await context.supabase
        .from("saved_projects")
        .update({ title: data.title, input: data.input, output: data.output })
        .eq("id", data.id)
        .eq("user_id", context.userId)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { id: row.id };
    }
    const { data: row, error } = await context.supabase
      .from("saved_projects")
      .insert({
        user_id: context.userId,
        tool: data.tool,
        title: data.title,
        input: data.input,
        output: data.output,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("saved_projects")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });