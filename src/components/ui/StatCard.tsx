import type { ComponentType, SVGProps } from "react";
import { Card } from "./Card";
import { cn } from "@/lib/cn";

const iconTones = {
  blue: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
  red: "bg-danger/12 text-danger",
  green: "bg-success/12 text-success",
  violet: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
} as const;

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon: Icon,
  iconTone = "blue",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "negative";
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  iconTone?: keyof typeof iconTones;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-secondary">{label}</p>
        {Icon && (
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              iconTones[iconTone],
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
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
