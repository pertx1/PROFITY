"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { DeleteAllButton } from "@/components/ui/DeleteAllButton";
import { FieldGroup, Input } from "@/components/ui/Field";
import { IconEdit, IconExternalLink, IconPlus, IconSearch } from "@/components/nav/icons";
import { formatDate } from "@/lib/format";
import {
  deleteAllInvoicesAction,
  deleteInvoiceAction,
  saveInvoiceAction,
  type InvoiceFormState,
} from "./actions";

type Invoice = {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
};

const emptyState: InvoiceFormState = {};

export function FacturasView({ invoices }: { invoices: Invoice[] }) {
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [query, setQuery] = useState("");
  const [state, formAction, isPending] = useActionState(saveInvoiceAction, emptyState);
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

  const formKey = editing?.id ?? "new";
  const normalizedQuery = query.trim().toLowerCase();
  const visibleInvoices = normalizedQuery
    ? invoices.filter((i) => i.name.toLowerCase().includes(normalizedQuery))
    : invoices;

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">
            {editing ? "Editar factura" : "Nueva factura"}
          </h2>
          {invoices.length > 0 && (
            <DeleteAllButton
              action={deleteAllInvoicesAction}
              confirmMessage={`¿Seguro que quieres borrar TODAS tus facturas (${invoices.length})? No se puede deshacer.`}
            />
          )}
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

          <FieldGroup label="Nombre" htmlFor="name" className="lg:col-span-1">
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={editing?.name ?? ""}
              key={`${formKey}-name`}
              placeholder="Ej. 30 camisetas, Camisetas de fútbol"
              required
            />
          </FieldGroup>

          <FieldGroup label="Enlace de Drive" htmlFor="url" className="lg:col-span-2">
            <Input
              id="url"
              name="url"
              type="url"
              defaultValue={editing?.url ?? ""}
              key={`${formKey}-url`}
              placeholder="https://drive.google.com/…"
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
            <p className="sm:col-span-2 lg:col-span-4 text-sm text-danger">{state.error}</p>
          )}
        </form>
      </Card>

      {invoices.length > 0 && (
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
          <Input
            type="search"
            placeholder="Buscar por nombre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      <Card className="overflow-hidden">
        {invoices.length === 0 ? (
          <p className="py-10 text-center text-sm text-secondary">
            Todavía no has añadido ninguna factura.
          </p>
        ) : visibleInvoices.length === 0 ? (
          <p className="py-10 text-center text-sm text-secondary">
            Ninguna factura coincide con &quot;{query}&quot;.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {visibleInvoices.map((invoice) => (
              <li key={invoice.id} className="flex items-center gap-3 px-5 py-3">
                <a
                  href={invoice.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-accent hover:underline"
                >
                  <IconExternalLink className="h-4 w-4 shrink-0" />
                  <span className="truncate">{invoice.name}</span>
                </a>
                <span className="shrink-0 text-xs text-secondary">
                  {formatDate(invoice.createdAt)}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Editar"
                    onClick={() => {
                      setEditing(invoice);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
                  >
                    <IconEdit className="h-4 w-4" />
                  </button>
                  <form action={deleteInvoiceAction}>
                    <input type="hidden" name="id" value={invoice.id} />
                    <DeleteButton confirmMessage="¿Eliminar esta factura?" />
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
