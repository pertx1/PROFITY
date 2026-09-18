export function StockAdjustForm({
  action,
  hidden,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden: Record<string, string>;
}) {
  return (
    <form action={action} className="flex items-center gap-1.5">
      {Object.entries(hidden).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <button
        type="submit"
        name="direction"
        value="-1"
        aria-label="Quitar stock"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-sm font-semibold text-secondary transition-colors hover:border-danger hover:bg-danger/10 hover:text-danger"
      >
        −
      </button>
      <input
        type="number"
        name="amount"
        defaultValue={1}
        min={1}
        aria-label="Cantidad"
        className="h-7 w-12 rounded-lg border border-border bg-background text-center text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      <button
        type="submit"
        name="direction"
        value="1"
        aria-label="Añadir stock"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-sm font-semibold text-secondary transition-colors hover:border-success hover:bg-success/10 hover:text-success"
      >
        +
      </button>
    </form>
  );
}
