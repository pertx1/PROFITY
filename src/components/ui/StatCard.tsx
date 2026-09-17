import { Card } from "./Card";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-secondary">{label}</p>
      <p
        className={cn(
          "mt-2 text-3xl font-semibold tracking-tight",
          tone === "positive" && "text-success",
          tone === "negative" && "text-danger",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-secondary">{hint}</p>}
    </Card>
  );
}
