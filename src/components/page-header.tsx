import type { LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-2xl text-primary-foreground"
          style={{ backgroundImage: "var(--gradient-surf)" }}
        >
          <Icon className="size-6" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold sm:text-2xl">{title}</h1>
          <p className="truncate text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {action}
    </header>
  );
}