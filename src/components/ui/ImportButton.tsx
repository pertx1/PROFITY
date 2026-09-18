"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type ImportState = { error?: string; imported?: number; skipped?: number };

export function ImportButton({
  action,
  label,
}: {
  action: (prevState: ImportState, formData: FormData) => Promise<ImportState>;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        Importar Excel
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border p-3"
    >
      <input
        type="file"
        name="file"
        accept=".xlsx"
        required
        className="text-sm text-secondary file:mr-3 file:rounded-full file:border-0 file:bg-accent/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Importando…" : label}
      </Button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          formRef.current?.reset();
        }}
        className="text-sm text-secondary hover:text-foreground"
      >
        Cancelar
      </button>
      {state.error && (
        <p className="w-full text-sm text-danger">{state.error}</p>
      )}
      {state.imported !== undefined && (
        <p className="w-full text-sm text-success">
          Importadas {state.imported} filas
          {state.skipped ? ` (${state.skipped} omitidas por datos incompletos)` : ""}
          .
        </p>
      )}
    </form>
  );
}
