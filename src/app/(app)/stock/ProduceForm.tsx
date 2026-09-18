"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { IconLayers } from "@/components/nav/icons";
import {
  TSHIRT_MODELS,
  TSHIRT_MODEL_LABELS,
  TSHIRT_SIZES,
  availableDesignsForModel,
  isStandaloneDesign,
  pairedVariantForModel,
  type TshirtModel,
} from "@/lib/stock-catalog";
import { registerProductionAction, type ProductionFormState } from "./actions";

const emptyState: ProductionFormState = {};

export function ProduceForm() {
  const [model, setModel] = useState<TshirtModel>("NEGRA");
  const [state, formAction, isPending] = useActionState(
    registerProductionAction,
    emptyState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current && !isPending && state.success) {
      submittedRef.current = false;
      formRef.current?.reset();
      setModel("NEGRA");
    }
  }, [state, isPending]);

  const designs = useMemo(() => availableDesignsForModel(model), [model]);
  const pairedVariant = pairedVariantForModel(model);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
          <IconLayers className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold">Registrar producción</h2>
          <p className="text-xs text-secondary">
            Elige camiseta y talla, y si llevaba un DTF se resta solo.
          </p>
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
        <FieldGroup label="Modelo" htmlFor="prod-model">
          <Select
            id="prod-model"
            name="model"
            value={model}
            onChange={(e) => setModel(e.target.value as TshirtModel)}
          >
            {TSHIRT_MODELS.map((m) => (
              <option key={m} value={m}>
                {TSHIRT_MODEL_LABELS[m]}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup label="Talla" htmlFor="prod-size">
          <Select id="prod-size" name="size" defaultValue="M">
            {TSHIRT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup label="Cantidad" htmlFor="prod-quantity">
          <Input
            id="prod-quantity"
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            required
          />
        </FieldGroup>

        <FieldGroup label="Diseño DTF" htmlFor="prod-design">
          <Select id="prod-design" name="designName" defaultValue="">
            <option value="">Sin DTF</option>
            {designs.map((name) => (
              <option key={name} value={name}>
                {isStandaloneDesign(name)
                  ? name
                  : `${name}${pairedVariant ? ` (DTF ${pairedVariant.toLowerCase()})` : ""}`}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
          {state.error && (
            <p className="mr-auto self-center text-sm text-danger">{state.error}</p>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Registrando…" : "Registrar y descontar stock"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
