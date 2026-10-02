"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { IconAlert, IconPlus } from "@/components/nav/icons";
import {
  deleteDesignRuleAction,
  deleteShirtRuleAction,
  saveDesignRuleAction,
  saveShirtRuleAction,
  type RuleFormState,
} from "./actions";

const emptyState: RuleFormState = {};
const DTF_COLOR_SUGGESTIONS = ["negro", "blanco", "a todo color"];

function RuleRow({
  left,
  right,
  note,
  children,
}: {
  left: string;
  right: string;
  note?: string;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex min-h-12 items-center gap-3 py-2">
      <span className="min-w-0 flex-1 break-words text-[15px] font-medium capitalize">{left}</span>
      <span className="text-secondary" aria-hidden>
        →
      </span>
      <span className="min-w-0 flex-[1.3] break-words text-[15px]">
        DTF {right}
        {note && <span className="block text-xs text-secondary">{note}</span>}
      </span>
      <span className="flex w-8 justify-end">{children}</span>
    </li>
  );
}

export function AjustesView({
  shirtRules,
  designRules,
  colorsWithoutRule,
  designs,
}: {
  shirtRules: { id: string; shirtColor: string; dtfColor: string }[];
  designRules: { id: string; design: string; dtfColor: string }[];
  colorsWithoutRule: string[];
  designs: string[];
}) {
  const [shirtState, shirtAction, shirtPending] = useActionState(saveShirtRuleAction, emptyState);
  const [designState, designAction, designPending] = useActionState(
    saveDesignRuleAction,
    emptyState,
  );
  const shirtColorRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <h2 className="text-base font-semibold">Color de camiseta → color del DTF</h2>
        <p className="mt-0.5 text-xs text-secondary">
          Blanca y negra ya vienen puestas. Si añades una regla con el mismo color, manda la tuya.
        </p>

        {colorsWithoutRule.length > 0 && (
          <div className="mt-4 rounded-2xl border border-warning/40 bg-warning/10 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#a15c00] dark:text-warning">
              <IconAlert className="h-4 w-4" />
              Colores de tus pedidos sin regla
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {colorsWithoutRule.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    if (shirtColorRef.current) {
                      shirtColorRef.current.value = color;
                      shirtColorRef.current.focus();
                    }
                  }}
                  className="min-h-9 rounded-full border border-warning/50 bg-surface px-3 text-sm font-medium capitalize"
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        <ul className="mt-3 divide-y divide-border">
          <RuleRow left="Blanca" right="negro" note="por defecto" />
          <RuleRow left="Negra" right="blanco" note="por defecto" />
          {shirtRules.map((rule) => (
            <RuleRow key={rule.id} left={rule.shirtColor} right={rule.dtfColor}>
              <form action={deleteShirtRuleAction}>
                <input type="hidden" name="id" value={rule.id} />
                <DeleteButton confirmMessage={`¿Borrar la regla de "${rule.shirtColor}"?`} />
              </form>
            </RuleRow>
          ))}
        </ul>

        <form
          key={`shirt-${shirtState.ok ?? 0}`}
          action={shirtAction}
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <FieldGroup label="Color de camiseta" htmlFor="shirtColor">
            <Input
              id="shirtColor"
              name="shirtColor"
              list="shirt-color-options"
              ref={shirtColorRef}
              placeholder="Ej. roja"
              required
            />
            <datalist id="shirt-color-options">
              {colorsWithoutRule.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </FieldGroup>
          <FieldGroup label="Color del DTF" htmlFor="dtfColor">
            <Input
              id="dtfColor"
              name="dtfColor"
              list="dtf-color-options"
              placeholder="Ej. blanco"
              required
            />
            <datalist id="dtf-color-options">
              {DTF_COLOR_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </FieldGroup>
          <Button type="submit" disabled={shirtPending}>
            <IconPlus className="h-4 w-4" />
            {shirtPending ? "Guardando…" : "Guardar regla"}
          </Button>
          {shirtState.error && (
            <p className="text-sm text-danger sm:col-span-3">{shirtState.error}</p>
          )}
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-semibold">DTF especial por diseño</h2>
        <p className="mt-0.5 text-xs text-secondary">
          Para diseños que siempre llevan el mismo DTF (por ejemplo a todo color), sea cual sea el
          color de la camiseta. Tiene prioridad sobre las reglas de arriba.
        </p>

        {designRules.length > 0 && (
          <ul className="mt-3 divide-y divide-border">
            {designRules.map((rule) => (
              <RuleRow key={rule.id} left={rule.design} right={rule.dtfColor}>
                <form action={deleteDesignRuleAction}>
                  <input type="hidden" name="id" value={rule.id} />
                  <DeleteButton confirmMessage={`¿Quitar el DTF especial de "${rule.design}"?`} />
                </form>
              </RuleRow>
            ))}
          </ul>
        )}

        <form
          key={`design-${designState.ok ?? 0}`}
          action={designAction}
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <FieldGroup label="Diseño" htmlFor="design">
            <Select id="design" name="design" defaultValue="" required>
              <option value="" disabled>
                Elige un diseño
              </option>
              {designs.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup label="DTF especial" htmlFor="designDtfColor">
            <Input
              id="designDtfColor"
              name="dtfColor"
              list="dtf-color-options"
              placeholder="Ej. a todo color"
              required
            />
          </FieldGroup>
          <Button type="submit" disabled={designPending}>
            <IconPlus className="h-4 w-4" />
            {designPending ? "Guardando…" : "Guardar"}
          </Button>
          {designState.error && (
            <p className="text-sm text-danger sm:col-span-3">{designState.error}</p>
          )}
        </form>
      </Card>
    </div>
  );
}
