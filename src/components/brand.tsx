import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <img
        src={logo}
        alt="AI Workplace Productivity Assistant logo"
        width={512}
        height={512}
        className="size-9 shrink-0"
      />
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate font-display text-sm font-semibold leading-tight">
            Workplace AI
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            Productivity Assistant
          </span>
        </span>
      )}
    </span>
  );
}