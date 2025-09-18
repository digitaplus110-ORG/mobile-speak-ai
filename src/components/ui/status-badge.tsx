import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "idle" | "processing" | "error";
  children: React.ReactNode;
  className?: string;
}

const statusStyles = {
  active: "gradient-success text-success-foreground shadow-success",
  idle: "bg-muted text-muted-foreground",
  processing: "gradient-primary text-primary-foreground shadow-glow animate-pulse-glow",
  error: "bg-destructive text-destructive-foreground",
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-smooth",
        statusStyles[status],
        className
      )}
    >
      <div className="w-2 h-2 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
}