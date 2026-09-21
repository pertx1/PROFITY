"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { DeleteAllButton } from "@/components/ui/DeleteAllButton";
import { FieldGroup, Input } from "@/components/ui/Field";
import { IconEdit, IconPlus, IconScale, IconTrendDown, IconTrendUp } from "@/components/nav/icons";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDate, toDateInputValue } from "@/lib/format";
import {
  deleteAllVintedComprasAction,
  deleteAllVintedVentasAction,
  deleteVintedItemAction,
  saveVintedItemAction,
  type VintedFormState,
} from "./actions";

type VintedItem = {
  id: string;
  date: Date;
  name: string;
  size: string | null;
  price: number;
};

const emptyState: VintedFormState = {};

function VintedSection({
  type,
  title,
  description,
  items,
  sign,
  tone,
  deleteAllAction,
}: {
  type: "COMPRA" | "VENTA";
  title: string;
  description: string;
  items: VintedItem[];
  sign: "+" | "-";
  tone: "danger" | "success";
  deleteAllAction: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<VintedItem | null>(null);
  const [state, formAction, isPending] = useActionState(saveVintedItemAction, emptyState);
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
  const formKey = editing?.id ?? "new";
  const total = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs text-secondary">{description}</p>
        </div>
        {items.length > 0 && (
          <DeleteAllButton
            action={deleteAllAction}
            confirmMessage={`¿Seguro que quieres borrar TODAS las ${title.toLowerCase()}s de Vinted (${items.length})? También se borran sus ${type === "COMPRA" ? "gastos" : "ingresos"} asociados. No se puede deshacer.`}
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
        <input type="hidden" name="type" value={type} />

        <FieldGroup label="Fecha" htmlFor={`${type}-date`}>
          <Input
            id={`${type}-date`}
            name="date"
            type="date"
            defaultValue={editing ? toDateInputValue(editing.date) : today}
            key={`${formKey}-date`}
            max={today}
            required
          />
        </FieldGroup>

        <FieldGroup label="Nombre" htmlFor={`${type}-name`}>
          <Input
            id={`${type}-name`}
            name="name"
            type="text"
            defaultValue={editing?.name ?? ""}
            key={`${formKey}-name`}
            placeholder="Ej. Sudadera Nike"
            required
          />
        </FieldGroup>

        <FieldGroup label="Talla" htmlFor={`${type}-size`}>
          <Input
            id={`${type}-size`}
            name="size"
            type="text"
            defaultValue={editing?.size ?? ""}
            key={`${formKey}-size`}
            placeholder="Opcional"
          />
        </FieldGroup>

        <FieldGroup label="Precio (€)" htmlFor={`${type}-price`}>
          <Input
            id={`${type}-price`}
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={editing?.price ?? ""}
            key={`${formKey}-price`}
            required
          />
        </FieldGroup>

        <div className="flex items-end gap-2">
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
            {isPending ? "Guardando…" : editing ? "Guardar" : "Añadir"}
          </Button>
        </div>

        {state.error && (
          <p className="sm:col-span-2 lg:col-span-5 text-sm text-danger">{state.error}</p>
        )}
      </form>

      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-secondary">
            Todavía no has añadido ninguna {title.toLowerCase()}.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="mt-0.5 text-xs text-secondary">
                    {[item.size ? `Talla ${item.size}` : null, formatDate(item.date)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span
                    className={cn(
                      "mr-2 text-sm font-semibold",
                      tone === "danger" ? "text-danger" : "text-success",
                    )}
                  >
                    {sign}
                    {formatCurrency(item.price)}
                  </span>
                  <button
                    type="button"
                    aria-label="Editar"
                    onClick={() => {
                      setEditing(item);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
                  >
                    <IconEdit className="h-4 w-4" />
                  </button>
                  <form action={deleteVintedItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <DeleteButton confirmMessage="¿Eliminar este artículo? También se borra su apunte en Gastos/Ingresos." />
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-3 text-right text-sm text-secondary">
        Total: <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
      </p>
    </Card>
  );
}

export function VintedView({
  compras,
  ventas,
}: {
  compras: VintedItem[];
  ventas: VintedItem[];
}) {
  const comprasTotal = compras.reduce((sum, i) => sum + i.price, 0);
  const ventasTotal = ventas.reduce((sum, i) => sum + i.price, 0);
  const beneficio = ventasTotal - comprasTotal;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Gastado en compras"
          value={formatCurrency(comprasTotal)}
          icon={IconTrendDown}
          iconTone="red"
        />
        <StatCard
          label="Ganado en ventas"
          value={formatCurrency(ventasTotal)}
          icon={IconTrendUp}
          iconTone="green"
        />
        <StatCard
          label="Beneficio Vinted"
          value={formatCurrency(beneficio)}
          tone={beneficio >= 0 ? "positive" : "negative"}
          icon={IconScale}
          iconTone={beneficio >= 0 ? "green" : "red"}
        />
      </div>

      <VintedSection
        type="COMPRA"
        title="Compra"
        description="Cada artículo que compras suma en Gastos."
        items={compras}
        sign="-"
        tone="danger"
        deleteAllAction={deleteAllVintedComprasAction}
      />
      <VintedSection
        type="VENTA"
        title="Venta"
        description="Cada artículo que vendes suma en Ingresos."
        items={ventas}
        sign="+"
        tone="success"
        deleteAllAction={deleteAllVintedVentasAction}
      />
    </div>
  );
}
