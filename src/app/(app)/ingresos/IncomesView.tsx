"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { DeleteAllButton } from "@/components/ui/DeleteAllButton";
import { FieldGroup, Input } from "@/components/ui/Field";
import { IconEdit, IconPlus, IconSearch } from "@/components/nav/icons";
import { cn } from "@/lib/cn";
import { getCategoryStyle } from "@/lib/category-color";
import { formatCurrency, formatDate, toDateInputValue } from "@/lib/format";
import {
  deleteAllIncomesAction,
  deleteIncomeAction,
  saveIncomeAction,
  type IncomeFormState,
} from "./actions";

type Income = {
  id: string;
  date: Date;
  source: string;
  concept: string | null;
  amount: number;
  method: string | null;
};

const emptyState: IncomeFormState = {};

export function IncomesView({
  incomes,
  sources,
  methods,
}: {
  incomes: Income[];
  sources: string[];
  methods: string[];
}) {
  const [editing, setEditing] = useState<Income | null>(null);
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"date" | "az" | "za">("date");
  const [state, formAction, isPending] = useActionState(
    saveIncomeAction,
    emptyState,
  );
  const submittedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (submittedRef.current && !isPending) {
      submittedRef.current = false;
      if (!state.error) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEditing(null);
        formRef.current?.reset();
      }
    }
  }, [state, isPending]);

  const today = toDateInputValue(new Date());
  const normalizedQuery = query.trim().toLowerCase();
  const filteredIncomes = normalizedQuery
    ? incomes.filter((income) =>
        [income.source, income.concept, income.method]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery)),
      )
    : incomes;
  const visibleIncomes =
    sortOrder === "date"
      ? filteredIncomes
      : [...filteredIncomes].sort((a, b) =>
          sortOrder === "az"
            ? a.source.localeCompare(b.source, "es")
            : b.source.localeCompare(a.source, "es"),
        );

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">
            {editing ? "Editar ingreso" : "Nuevo ingreso"}
          </h2>
          {incomes.length > 0 && (
            <DeleteAllButton
              action={deleteAllIncomesAction}
              confirmMessage={`¿Seguro que quieres borrar TODOS tus ingresos manuales (${incomes.length})? No se puede deshacer.`}
            />
          )}
        </div>
        <form
          ref={formRef}
          action={formAction}
          onSubmit={() => {
            submittedRef.current = true;
          }}
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <input type="hidden" name="id" value={editing?.id ?? ""} />

          <FieldGroup label="Fecha" htmlFor="date">
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={editing ? toDateInputValue(editing.date) : today}
              key={editing?.id ?? "new-date"}
              max={today}
              required
            />
          </FieldGroup>

          <FieldGroup label="Fuente" htmlFor="source">
            <Input
              id="source"
              name="source"
              list="source-options"
              defaultValue={editing?.source ?? ""}
              key={editing?.id ?? "new-source"}
              placeholder="Ej. Etsy, Subvención, Reembolso"
              required
            />
            <datalist id="source-options">
              {sources.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </FieldGroup>

          <FieldGroup label="Concepto" htmlFor="concept" className="lg:col-span-1">
            <Input
              id="concept"
              name="concept"
              defaultValue={editing?.concept ?? ""}
              key={editing?.id ?? "new-concept"}
              placeholder="Opcional"
            />
          </FieldGroup>

          <FieldGroup label="Importe (€)" htmlFor="amount">
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={editing?.amount ?? ""}
              key={editing?.id ?? "new-amount"}
              required
            />
          </FieldGroup>

          <FieldGroup label="Método" htmlFor="method">
            <Input
              id="method"
              name="method"
              list="method-options"
              defaultValue={editing?.method ?? ""}
              key={editing?.id ?? "new-method"}
              placeholder="Transferencia, PayPal…"
            />
            <datalist id="method-options">
              {methods.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </FieldGroup>

          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
            {state.error && (
              <p className="mr-auto self-center text-sm text-danger">
                {state.error}
              </p>
            )}
            {editing && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(null);
                  formRef.current?.reset();
                }}
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              <IconPlus className="h-4 w-4" />
              {isPending ? "Guardando…" : editing ? "Guardar cambios" : "Añadir ingreso"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
        <Input
          type="search"
          placeholder="Buscar por fuente, concepto o método…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-secondary">Ordenar:</span>
        {(
          [
            { key: "date", label: "Recientes" },
            { key: "az", label: "Fuente A → Z" },
            { key: "za", label: "Fuente Z → A" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setSortOrder(opt.key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              sortOrder === opt.key
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-secondary hover:bg-black/[.03] dark:hover:bg-white/[.06]",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        {incomes.length === 0 ? (
          <p className="py-10 text-center text-sm text-secondary">
            Todavía no has registrado ingresos aquí. Los pedidos cuentan aparte,
            esto es para dinero que entra sin ser un pedido.
          </p>
        ) : visibleIncomes.length === 0 ? (
          <p className="py-10 text-center text-sm text-secondary">
            Ningún ingreso coincide con &quot;{query}&quot;.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {visibleIncomes.map((income) => {
              const style = getCategoryStyle(income.source);
              return (
                <li key={income.id} className="flex items-center gap-3 px-5 py-3">
                  <span className={cn("h-9 w-1 shrink-0 rounded-full", style.dot)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <CategoryBadge label={income.source} />
                      {income.concept && (
                        <span className="text-sm text-secondary">{income.concept}</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-secondary">
                      {formatDate(income.date)}
                      {income.method ? ` · ${income.method}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="mr-2 text-sm font-semibold text-success">
                      +{formatCurrency(income.amount)}
                    </span>
                    <button
                      type="button"
                      aria-label="Editar"
                      onClick={() => {
                        setEditing(income);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
                    >
                      <IconEdit className="h-4 w-4" />
                    </button>
                    <form action={deleteIncomeAction}>
                      <input type="hidden" name="id" value={income.id} />
                      <DeleteButton confirmMessage="¿Eliminar este ingreso?" />
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
