import { getCategoryStyle } from "@/lib/category-color";
import { cn } from "@/lib/cn";

export function CategoryBadge({ label }: { label: string }) {
  const style = getCategoryStyle(label);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        style.bg,
        style.text,
      )}
    >
      {label}
    </span>
  );
}
