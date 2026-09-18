import { Card } from "@/components/ui/Card";
import { IconAlert } from "@/components/nav/icons";
import { cn } from "@/lib/cn";

export function NeedsOrderPanel({
  items,
}: {
  items: { key: string; label: string; quantity: number }[];
}) {
  if (items.length === 0) {
    return (
      <Card className="flex items-center gap-3 border-success/30 bg-success/5 p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
          <IconAlert className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-success">Todo en orden</p>
          <p className="text-xs text-secondary">
            No falta ninguna camiseta ni ningún DTF por ahora.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-danger/30 bg-danger/5 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/15 text-danger">
          <IconAlert className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-danger">Pedir ya</h2>
          <p className="text-xs text-secondary">
            {items.length} {items.length === 1 ? "artículo" : "artículos"} a 0 o negativo
          </p>
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item.key}
            className={cn(
              "flex items-center gap-2 rounded-full border border-danger/40 bg-surface px-3 py-1.5 text-xs font-medium text-danger",
            )}
          >
            {item.label}
            <span className="rounded-full bg-danger/15 px-1.5 py-0.5 text-[11px] font-semibold">
              {item.quantity}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
