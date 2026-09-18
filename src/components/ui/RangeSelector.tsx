"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { rangePresets, type RangeKey } from "@/lib/date-range";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { toDateInputValue } from "@/lib/format";
import { cn } from "@/lib/cn";

export function RangeSelector({ current }: { current: RangeKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showCustom, setShowCustom] = useState(current === "custom");

  const today = toDateInputValue(new Date());
  const defaultFrom = searchParams.get("from") ?? today;
  const defaultTo = searchParams.get("to") ?? today;

  function selectPreset(key: RangeKey) {
    if (key === "custom") {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    router.push(`${pathname}?range=${key}`);
  }

  function applyCustom(formData: FormData) {
    const from = String(formData.get("from") ?? "");
    const to = String(formData.get("to") ?? "");
    if (!from || !to) return;
    router.push(`${pathname}?range=custom&from=${from}&to=${to}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {rangePresets.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => selectPreset(preset.key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              current === preset.key
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-secondary hover:bg-black/[.03] dark:hover:bg-white/[.06]",
            )}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => selectPreset("custom")}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            current === "custom"
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-secondary hover:bg-black/[.03] dark:hover:bg-white/[.06]",
          )}
        >
          Personalizado
        </button>
      </div>

      {showCustom && (
        <form
          action={applyCustom}
          className="flex flex-wrap items-end gap-2 rounded-xl border border-border p-3"
        >
          <div>
            <label htmlFor="from" className="mb-1 block text-xs font-medium text-secondary">
              Desde
            </label>
            <Input id="from" name="from" type="date" defaultValue={defaultFrom} max={today} />
          </div>
          <div>
            <label htmlFor="to" className="mb-1 block text-xs font-medium text-secondary">
              Hasta
            </label>
            <Input id="to" name="to" type="date" defaultValue={defaultTo} max={today} />
          </div>
          <Button type="submit" variant="secondary">
            Aplicar
          </Button>
        </form>
      )}
    </div>
  );
}
