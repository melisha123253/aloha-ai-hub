import { ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";

export function AiDisclaimer({
  className,
  variant = "inline",
}: {
  className?: string;
  variant?: "inline" | "card";
}) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 text-xs leading-relaxed text-muted-foreground",
        variant === "card" && "glass rounded-2xl p-4 text-sm",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-coral" />
      <span>
        AI-generated content should be reviewed before professional use. You are responsible for
        verifying accuracy, tone and compliance before sending or sharing anything produced here.
      </span>
    </p>
  );
}