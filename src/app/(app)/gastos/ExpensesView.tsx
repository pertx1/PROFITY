"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { FieldGroup, Input } from "@/components/ui/Field";
import { IconEdit, IconPlus } from "@/components/nav/icons";
import { formatCurrency, formatDate, toDateInputValue } from "@/lib/format";
import { deleteExpenseAction, saveExpenseAction, type ExpenseFormState } from "./actions";

type Expense = {
  id: string;
  date: Date;
  category: string;
  concept: string | null;
  amount: number;
  paymentMethod: string | null;
};

const emptyState: ExpenseFormState = {};

export function ExpensesView({
  expenses,
  categories,
  paymentMethods,
}: {
  expenses: Expense[];
  categories: string[];
  paymentMethods: string[];
}) {
  const [editing, setEditing] = useState<Expense | null>(null);
  const [state, formAction, isPending] = useActionState(
    saveExpenseAction,
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

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <h2 className="text-base font-semibold">
          {editing ? "Editar gasto" : "Nuevo gasto"}
        </h2>
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
              defaultValue={
                editing ? toDateInputValue(editing.date) : today
              }
              key={editing?.id ?? "new-date"}
              max={today}
              required
            />
          </FieldGroup>

          <FieldGroup label="Categoría" htmlFor="category">
            <Input
              id="category"
              name="category"
              list="category-options"
              defaultValue={editing?.category ?? ""}
              key={editing?.id ?? "new-category"}
              placeholder="Ej. DTF, Camisetas, Envío"
              required
            />
            <datalist id="category-options">
              {categories.map((c) => (
                <option key={c} value={c} />
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

          <FieldGroup label="Método de pago" htmlFor="paymentMethod">
            <Input
              id="paymentMethod"
              name="paymentMethod"
              list="payment-options"
              defaultValue={editing?.paymentMethod ?? ""}
              key={editing?.id ?? "new-payment"}
              placeholder="Efectivo, Tarjeta…"
            />
            <datalist id="payment-options">
              {paymentMethods.map((p) => (
                <option key={p} value={p} />
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
              {isPending ? "Guardando…" : editing ? "Guardar cambios" : "Añadir gasto"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {expenses.length === 0 ? (
          <p className="py-10 text-center text-sm text-secondary">
            Todavía no has registrado ningún gasto.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {expense.category}
                    {expense.concept ? (
                      <span className="font-normal text-secondary">
                        {" "}
                        · {expense.concept}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-secondary">
                    {formatDate(expense.date)}
                    {expense.paymentMethod ? ` · ${expense.paymentMethod}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="mr-2 text-sm font-semibold text-danger">
                    -{formatCurrency(expense.amount)}
                  </span>
                  <button
                    type="button"
                    aria-label="Editar"
                    onClick={() => {
                      setEditing(expense);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
                  >
                    <IconEdit className="h-4 w-4" />
                  </button>
                  <form action={deleteExpenseAction}>
                    <input type="hidden" name="id" value={expense.id} />
                    <DeleteButton confirmMessage="¿Eliminar este gasto?" />
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
