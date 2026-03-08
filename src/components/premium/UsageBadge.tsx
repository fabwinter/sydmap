interface UsageBadgeProps {
  used: number;
  limit: number;
  label: string;
}

export function UsageBadge({ used, limit, label }: UsageBadgeProps) {
  if (limit === Infinity) return null;
  
  const remaining = Math.max(0, limit - used);
  const isAtLimit = remaining === 0;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isAtLimit
          ? "bg-destructive/10 text-destructive"
          : remaining <= 1
          ? "bg-warning/10 text-warning"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {remaining}/{limit} {label}
    </span>
  );
}
