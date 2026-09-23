import type { ComponentType, SVGProps } from "react";
import { Card } from "./Card";
import { cn } from "@/lib/cn";

// Squircles sólidas con icono blanco, como los badges de Ajustes/Salud en
// iOS, en vez de un círculo pastel.
const iconTones = {
  blue: "bg-accent",
  red: "bg-danger",
  green: "bg-success",
  violet: "bg-[#af52de] dark:bg-[#bf5af2]",
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
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] text-white shadow-sm",
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
