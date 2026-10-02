"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { IconAlert, IconChevronRight } from "@/components/nav/icons";
import { cn } from "@/lib/cn";
import { formatOrderRef } from "@/lib/format";
import { printBagToText, type BagWarning } from "@/lib/print-bag";
import type { CheckedBagLine } from "@/lib/print-bag-server";
import { resetPrintBagAction, togglePrintBagLineAction } from "@/app/(app)/bolsa-actions";

type Lines = { shirts: CheckedBagLine[]; dtfs: CheckedBagLine[] };
type Action = { type: "toggle"; key: string; checked: boolean } | { type: "reset" };

function applyAction(state: Lines, action: Action): Lines {
  const update = (line: CheckedBagLine): CheckedBagLine => {
    if (action.type === "reset") return { ...line, checked: false, changed: false };
    return line.key === action.key ? { ...line, checked: action.checked, changed: false } : line;
  };
  return { shirts: state.shirts.map(update), dtfs: state.dtfs.map(update) };
}

const sumQuantity = (lines: CheckedBagLine[]) => lines.reduce((sum, l) => sum + l.quantity, 0);

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    return ok;
  }
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function BagLineItem({
  line,
  onToggle,
}: {
  line: CheckedBagLine;
  onToggle: (line: CheckedBagLine) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li
      className={cn(
        "py-1.5 transition-colors",
        line.changed && "-mx-2 rounded-2xl bg-warning/10 px-2",
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="checkbox"
          aria-checked={line.checked}
          aria-label={`Meter en la bolsa: ${line.quantity} × ${line.label}`}
          onClick={() => onToggle(line)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        >
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-[9px] border-2 transition duration-200 ease-spring motion-safe:active:scale-90",
              line.checked
                ? "border-success bg-success text-white"
                : "border-secondary/50 bg-surface text-transparent",
            )}
          >
            <CheckIcon className="h-5 w-5" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-h-12 min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span
            className={cn(
              "min-w-0 flex-1 text-[15px] leading-snug transition-colors",
              line.checked && "text-secondary line-through",
            )}
          >
            <span className="font-semibold tabular-nums">{line.quantity} ×</span> {line.label}
            {line.changed && (
              <span className="ml-2 inline-block rounded-full bg-warning/20 px-2 py-0.5 align-middle text-[11px] font-semibold text-[#a15c00] no-underline dark:text-warning">
                ha cambiado
              </span>
            )}
          </span>
          <IconChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-secondary transition-transform duration-200 ease-spring",
              open && "rotate-90",
            )}
          />
        </button>
      </div>

      {line.missingRuleFor && (
        <p className="ml-14 flex items-start gap-1.5 text-xs text-[#a15c00] dark:text-warning">
          <IconAlert className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>
            No hay regla de DTF para camiseta {line.missingRuleFor}.{" "}
            <Link href="/ajustes" className="font-semibold text-accent">
              Añadir regla
            </Link>
          </span>
        </p>
      )}

      {open && (
        <ul className="mb-1 ml-14 mt-1 flex flex-col gap-1 border-l-2 border-border pl-3">
          {line.sources.map((source) => (
            <li key={source.id}>
              <Link
                href={`/pedidos?editar=${source.id}`}
                className="flex flex-wrap items-baseline gap-x-1.5 text-sm text-secondary hover:text-foreground"
              >
                <span className="font-semibold text-foreground">
                  {source.orderNumber ? formatOrderRef(source.orderNumber) : "Sin nº"}
                </span>
                <span>
                  · {[source.model, source.color, source.size].filter(Boolean).join(" · ")}
                  {source.quantity > 1 ? ` · ×${source.quantity}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function BagBlock({
  title,
  totalLabel,
  lines,
  onToggle,
}: {
  title: string;
  totalLabel: string;
  lines: CheckedBagLine[];
  onToggle: (line: CheckedBagLine) => void;
}) {
  // Las marcadas bajan al final de su bloque, manteniendo el orden original.
  const sorted = [...lines].sort((a, b) => Number(a.checked) - Number(b.checked));
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
        <h3 className="text-[17px] font-semibold">{title}</h3>
        <span className="text-sm font-semibold tabular-nums text-secondary">{totalLabel}</span>
      </div>
      {sorted.length === 0 ? (
        <p className="py-4 text-sm text-secondary">Nada que llevar aquí.</p>
      ) : (
        <ul className="mt-1">
          {sorted.map((line) => (
            <BagLineItem key={line.key} line={line} onToggle={onToggle} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function PrintBagSection({
  pendingOrders,
  shirts,
  dtfs,
  warnings,
}: {
  pendingOrders: number;
  shirts: CheckedBagLine[];
  dtfs: CheckedBagLine[];
  warnings: BagWarning[];
}) {
  const [lines, applyOptimistic] = useOptimistic<Lines, Action>({ shirts, dtfs }, applyAction);
  const [, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const all = [...lines.shirts, ...lines.dtfs];
  const done = all.filter((l) => l.checked).length;
  const allDone = all.length > 0 && done === all.length;

  function toggle(line: CheckedBagLine) {
    const checked = !line.checked;
    startTransition(async () => {
      applyOptimistic({ type: "toggle", key: line.key, checked });
      await togglePrintBagLineAction({ key: line.key, quantity: line.quantity, checked });
    });
  }

  function reset() {
    if (!window.confirm("¿Desmarcar toda la lista?")) return;
    startTransition(async () => {
      applyOptimistic({ type: "reset" });
      await resetPrintBagAction();
    });
  }

  async function copy() {
    const ok = await copyText(printBagToText(lines));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Card className="p-5" aria-labelledby="print-bag-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="print-bag-title" className="text-[22px] font-bold tracking-tight">
          🎒 Bolsa para la imprenta
        </h2>
        <Link href="/ajustes" className="text-sm font-medium text-accent">
          ⚙️ Colores de DTF
        </Link>
      </div>

      {pendingOrders === 0 ? (
        <p className="py-8 text-center text-[15px] text-secondary">
          No hay nada pendiente para la imprenta
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-5">
          {warnings.length > 0 && (
            <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#a15c00] dark:text-warning">
                <IconAlert className="h-4 w-4" />
                {warnings.length === 1
                  ? "1 pedido sin hacer está incompleto"
                  : `${warnings.length} pedidos sin hacer están incompletos`}
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {warnings.map((w) => (
                  <li key={w.orderId}>
                    <Link
                      href={`/pedidos?editar=${w.orderId}`}
                      className="flex min-h-9 items-center justify-between gap-2 text-sm"
                    >
                      <span>
                        <span className="font-semibold">{w.orderRef}</span>
                        <span className="text-secondary"> · {w.problems.join(", ")}</span>
                      </span>
                      <span className="shrink-0 font-semibold text-accent">Completar</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {all.length > 0 && (
            <div>
              <p
                className={cn(
                  "text-[15px] font-semibold",
                  allDone ? "text-success" : "text-foreground",
                )}
                aria-live="polite"
              >
                {allDone
                  ? "✅ Todo listo para la imprenta"
                  : `${done} de ${all.length} metidos en la bolsa`}
              </p>
              <div
                className="mt-2 h-2.5 overflow-hidden rounded-full bg-border/60"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={all.length}
                aria-valuenow={done}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-300 ease-spring",
                    allDone ? "bg-success" : "bg-accent",
                  )}
                  style={{ width: `${(done / all.length) * 100}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copy}
                  className="min-h-11 rounded-full bg-accent px-4 text-sm font-medium text-accent-foreground transition duration-200 ease-spring motion-safe:active:scale-[0.97]"
                >
                  {copied ? "¡Copiada!" : "Copiar lista"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  disabled={done === 0 && !all.some((l) => l.changed)}
                  className="min-h-11 rounded-full border border-border px-4 text-sm font-medium transition duration-200 ease-spring hover:bg-black/[.03] disabled:opacity-40 motion-safe:active:scale-[0.97] dark:hover:bg-white/[.06]"
                >
                  Reiniciar lista
                </button>
              </div>
            </div>
          )}

          <BagBlock
            title="👕 Camisetas lisas"
            totalLabel={`${sumQuantity(lines.shirts)} ${sumQuantity(lines.shirts) === 1 ? "camiseta" : "camisetas"}`}
            lines={lines.shirts}
            onToggle={toggle}
          />
          <BagBlock
            title="🖨️ DTF"
            totalLabel={`${sumQuantity(lines.dtfs)} DTF`}
            lines={lines.dtfs}
            onToggle={toggle}
          />
        </div>
      )}
    </Card>
  );
}
