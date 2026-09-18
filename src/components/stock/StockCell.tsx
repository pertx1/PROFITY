import { cn } from "@/lib/cn";
import { StockAdjustForm } from "./StockAdjustForm";

export function StockCell({
  label,
  sublabel,
  quantity,
  action,
  hidden,
}: {
  label: string;
  sublabel?: string;
  quantity: number;
  action: (formData: FormData) => void | Promise<void>;
  hidden: Record<string, string>;
}) {
  const low = quantity <= 0;
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-3 text-center",
        low ? "border-danger/40 bg-danger/5" : "border-border bg-background",
      )}
    >
      <div>
        <p className="text-xs font-medium text-secondary">{label}</p>
        {sublabel && <p className="text-[10.5px] leading-tight text-secondary/70">{sublabel}</p>}
      </div>
      <p
        className={cn(
          "text-2xl font-semibold tabular-nums",
          low ? "text-danger" : "text-foreground",
        )}
      >
        {quantity}
      </p>
      <StockAdjustForm action={action} hidden={hidden} />
    </div>
  );
}
