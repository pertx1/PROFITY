import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-border/70 bg-surface shadow-[0_1px_1px_rgba(0,0,0,0.04),0_10px_24px_-16px_rgba(0,0,0,0.18)] dark:shadow-[0_1px_1px_rgba(0,0,0,0.3),0_10px_24px_-16px_rgba(0,0,0,0.6)]",
        className,
      )}
      {...props}
    />
  );
}
