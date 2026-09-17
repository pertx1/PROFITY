import { orderStatusMeta, type OrderStatus } from "@/lib/order-status";
import { cn } from "@/lib/cn";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = orderStatusMeta[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[.04] px-2.5 py-1 text-xs font-medium dark:bg-white/[.08]">
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
