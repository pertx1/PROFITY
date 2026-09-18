"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { DeleteAllButton } from "@/components/ui/DeleteAllButton";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ImportButton } from "@/components/ui/ImportButton";
import { IconEdit, IconPlus, IconSearch } from "@/components/nav/icons";
import { cn } from "@/lib/cn";
import { getCategoryStyle } from "@/lib/category-color";
import { formatCurrency, formatDate, formatOrderRef, toDateInputValue } from "@/lib/format";
import { orderStatusMeta, orderStatusValues, type OrderStatus } from "@/lib/order-status";
import {
  deleteAllOrdersAction,
  deleteOrderAction,
  importOrdersAction,
  saveOrderAction,
  type OrderFormState,
} from "./actions";

type Order = {
  id: string;
  date: Date;
  orderNumber: string | null;
  quantity: number;
  model: string;
  color: string | null;
  size: string | null;
  price: number;
  status: OrderStatus;
};

const emptyState: OrderFormState = {};

export function OrdersView({
  orders,
  models,
  colors,
  sizes,
}: {
  orders: Order[];
  models: string[];
  colors: string[];
  sizes: string[];
}) {
  const [editing, setEditing] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "TODOS">(
    "TODOS",
  );
  const [query, setQuery] = useState("");
  const [state, formAction, isPending] = useActionState(
    saveOrderAction,
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
  const formKey = editing?.id ?? "new";
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOrders = orders.filter((order) => {
    if (statusFilter !== "TODOS" && order.status !== statusFilter) return false;
    if (!normalizedQuery) return true;
    return [order.model, order.color, order.size, order.orderNumber]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalizedQuery));
  });

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">
            {editing ? "Editar pedido" : "Nuevo pedido"}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <ImportButton action={importOrdersAction} label="Importar pedidos" />
            {orders.length > 0 && (
              <DeleteAllButton
                action={deleteAllOrdersAction}
                confirmMessage={`¿Seguro que quieres borrar TODOS tus pedidos (${orders.length})? No se puede deshacer.`}
              />
            )}
          </div>
        </div>
        <form
          ref={formRef}
          action={formAction}
          onSubmit={() => {
            submittedRef.current = true;
          }}
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <input type="hidden" name="id" value={editing?.id ?? ""} />

          <FieldGroup label="Fecha" htmlFor="date">
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={editing ? toDateInputValue(editing.date) : today}
              key={`${formKey}-date`}
              max={today}
              required
            />
          </FieldGroup>

          <FieldGroup label="Nº / nombre de pedido" htmlFor="orderNumber">
            <Input
              id="orderNumber"
              name="orderNumber"
              type="text"
              defaultValue={editing?.orderNumber ?? ""}
              key={`${formKey}-orderNumber`}
              placeholder="Ej. 1001 o Aingeru"
            />
          </FieldGroup>

          <FieldGroup label="Modelo" htmlFor="model">
            <Input
              id="model"
              name="model"
              list="model-options"
              defaultValue={editing?.model ?? ""}
              key={`${formKey}-model`}
              required
            />
            <datalist id="model-options">
              {models.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </FieldGroup>

          <FieldGroup label="Color" htmlFor="color">
            <Input
              id="color"
              name="color"
              list="color-options"
              defaultValue={editing?.color ?? ""}
              key={`${formKey}-color`}
              placeholder="Opcional"
            />
            <datalist id="color-options">
              {colors.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </FieldGroup>

          <FieldGroup label="Talla" htmlFor="size">
            <Input
              id="size"
              name="size"
              list="size-options"
              defaultValue={editing?.size ?? ""}
              key={`${formKey}-size`}
              placeholder="Opcional"
            />
            <datalist id="size-options">
              {sizes.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </FieldGroup>

          <FieldGroup label="Cantidad" htmlFor="quantity">
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              defaultValue={editing?.quantity ?? 1}
              key={`${formKey}-quantity`}
              required
            />
          </FieldGroup>

          <FieldGroup label="Precio (€)" htmlFor="price">
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={editing?.price ?? ""}
              key={`${formKey}-price`}
              required
            />
          </FieldGroup>

          <FieldGroup label="Estado" htmlFor="status">
            <Select
              id="status"
              name="status"
              defaultValue={editing?.status ?? "SIN_HACER"}
              key={`${formKey}-status`}
            >
              {orderStatusValues.map((s) => (
                <option key={s} value={s}>
                  {orderStatusMeta[s].label}
                </option>
              ))}
            </Select>
          </FieldGroup>

          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
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
              {isPending ? "Guardando…" : editing ? "Guardar cambios" : "Añadir pedido"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
        <Input
          type="search"
          placeholder="Buscar por modelo, color, talla o nº de pedido…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["TODOS", ...orderStatusValues] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-secondary hover:bg-black/[.03] dark:hover:bg-white/[.06]"
            }`}
          >
            {s === "TODOS" ? "Todos" : orderStatusMeta[s].label}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        {orders.length === 0 ? (
          <p className="py-10 text-center text-sm text-secondary">
            Todavía no has registrado ningún pedido.
          </p>
        ) : visibleOrders.length === 0 ? (
          <p className="py-10 text-center text-sm text-secondary">
            Ningún pedido coincide con los filtros.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {visibleOrders.map((order) => {
              const style = getCategoryStyle(order.model);
              return (
              <li
                key={order.id}
                className="flex items-center gap-3 px-5 py-3"
              >
                <span className={cn("h-10 w-1 shrink-0 rounded-full", style.dot)} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-base font-semibold">
                      {order.orderNumber ? formatOrderRef(order.orderNumber) : order.model}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <CategoryBadge label={order.model} />
                    <span className="text-sm text-secondary">
                      {[order.color, order.size, order.quantity > 1 ? `x${order.quantity}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-secondary">{formatDate(order.date)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="mr-2 text-sm font-semibold text-success">
                    +{formatCurrency(order.price)}
                  </span>
                  <button
                    type="button"
                    aria-label="Editar"
                    onClick={() => {
                      setEditing(order);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
                  >
                    <IconEdit className="h-4 w-4" />
                  </button>
                  <form action={deleteOrderAction}>
                    <input type="hidden" name="id" value={order.id} />
                    <DeleteButton confirmMessage="¿Eliminar este pedido?" />
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
