// Bolsa para la imprenta: a partir de los pedidos "Sin hacer" calcula qué
// camisetas lisas y qué DTF hay que llevar. Sin dependencias de servidor para
// poder usarse (y probarse) en cualquier lado.
import { isStandaloneDesign, resolveDtfDesign } from "@/lib/stock-catalog";

export type BagOrder = {
  id: string;
  orderNumber: string | null;
  model: string;
  color: string | null;
  size: string | null;
  quantity: number;
};

export type BagRules = {
  shirt: { shirtColorKey: string; dtfColor: string }[];
  design: { design: string; dtfColor: string }[];
};

export type BagSource = Omit<BagOrder, "quantity"> & { quantity: number };

export type BagLine = {
  key: string;
  kind: "shirt" | "dtf";
  label: string;
  quantity: number;
  sources: BagSource[];
  /** Color de camiseta (para mostrar) que no tiene regla de color de DTF. */
  missingRuleFor?: string;
};

export type BagWarning = {
  orderId: string;
  orderRef: string;
  problems: string[];
};

export type PrintBag = {
  pendingOrders: number;
  shirts: BagLine[];
  dtfs: BagLine[];
  warnings: BagWarning[];
  /** Colores de camiseta en pedidos de diseño sin regla de DTF definida. */
  colorsWithoutRule: string[];
};

export const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

// "Blanca"/"Blanco", "Roja"/"Rojo"… son el mismo color: se agrupan juntos
// quitando la -a/-o final de cada palabra.
export function colorKey(value: string) {
  return normalizeText(value)
    .split(" ")
    .map((word) => (word.length > 3 && /[ao]$/.test(word) ? word.slice(0, -1) : word))
    .join(" ");
}

const FEMININE: Record<string, string> = {
  blanco: "blanca",
  negro: "negra",
  rojo: "roja",
  amarillo: "amarilla",
  morado: "morada",
};

/** "Blanco" → "blanca", para que lea bien detrás de "Camiseta". */
function shirtColorLabel(value: string) {
  const lower = value.trim().replace(/\s+/g, " ").toLowerCase();
  return lower
    .split(" ")
    .map((word) => FEMININE[normalizeText(word)] ?? word)
    .join(" ");
}

/** "Negra" → "negro", para que lea bien detrás de "DTF …". */
function dtfColorLabel(value: string) {
  const lower = value.trim().replace(/\s+/g, " ").toLowerCase();
  const masculine = Object.fromEntries(
    Object.entries(FEMININE).map(([m, f]) => [f, m]),
  );
  return lower
    .split(" ")
    .map((word) => masculine[normalizeText(word)] ?? word)
    .join(" ");
}

/** "blanca" → "camiseta blanca"; "sudadera negra" → "sudadera negra". */
function garmentName(colorLabel: string) {
  return colorLabel.startsWith("sudadera") ? colorLabel : `camiseta ${colorLabel}`;
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const DEFAULT_DTF_BY_SHIRT: Record<string, string> = {
  [colorKey("sudadera negra")]: "blanco",
  [colorKey("sudadera")]: "blanco",
  [colorKey("blanca")]: "negro",
  [colorKey("white")]: "negro",
  [colorKey("negra")]: "blanco",
  [colorKey("black")]: "blanco",
};

/**
 * Color del DTF para un diseño sobre una camiseta. Prioridad: DTF especial
 * del diseño → tabla de Ajustes → blanco↔negro por defecto. Los diseños
 * "únicos" (BA…) no dependen del color de camiseta.
 */
export function resolveDtfColor(
  design: string,
  shirtColor: string | null,
  rules: BagRules,
): { color: string | null; unique?: boolean } {
  const designRule = rules.design.find(
    (r) => normalizeText(r.design) === normalizeText(design),
  );
  if (designRule) return { color: dtfColorLabel(designRule.dtfColor) };
  if (isStandaloneDesign(design)) return { color: null, unique: true };
  if (!shirtColor) return { color: null };

  const key = colorKey(shirtColor);
  const shirtRule = rules.shirt.find((r) => r.shirtColorKey === key);
  if (shirtRule) return { color: dtfColorLabel(shirtRule.dtfColor) };
  const fallback = DEFAULT_DTF_BY_SHIRT[key];
  return { color: fallback ?? null };
}

function sizeRank(size: string) {
  const index = SIZE_ORDER.indexOf(size.toUpperCase());
  return index === -1 ? SIZE_ORDER.length : index;
}

function orderRef(order: BagOrder) {
  if (!order.orderNumber) return order.model;
  return /^\d+$/.test(order.orderNumber) ? `#${order.orderNumber}` : order.orderNumber;
}

type Group = {
  key: string;
  kind: "shirt" | "dtf";
  quantity: number;
  sources: BagSource[];
  // datos para la etiqueta y el orden
  color?: string;
  size?: string;
  design?: string;
  dtfColor?: string | null;
  unique?: boolean;
  shirtColors: string[];
  missingRuleFor?: string;
};

function addToGroup(
  groups: Map<string, Group>,
  init: Omit<Group, "quantity" | "sources" | "shirtColors">,
  order: BagOrder,
  shirtColor: string | null,
) {
  let group = groups.get(init.key);
  if (!group) {
    group = { ...init, quantity: 0, sources: [], shirtColors: [] };
    groups.set(init.key, group);
  }
  group.quantity += order.quantity;
  group.sources.push({ ...order });
  if (shirtColor) {
    const label = shirtColorLabel(shirtColor);
    if (!group.shirtColors.includes(label)) group.shirtColors.push(label);
  }
}

export function buildPrintBag(orders: BagOrder[], rules: BagRules): PrintBag {
  const shirtGroups = new Map<string, Group>();
  const dtfGroups = new Map<string, Group>();
  const warnings: BagWarning[] = [];
  const colorsWithoutRule = new Map<string, string>();

  for (const order of orders) {
    const problems: string[] = [];
    const design = resolveDtfDesign(order.model);
    const size = order.size?.trim() ? order.size.trim().toUpperCase() : null;
    const modelMissing = !order.model.trim() || normalizeText(order.model) === "sin modelo";

    // Camiseta de un diseño: el color está en "color". Camiseta lisa: el
    // propio "modelo" es el color/tipo de camiseta.
    const shirtColor = design
      ? order.color?.trim() || null
      : modelMissing
        ? null
        : order.model.trim();

    if (modelMissing) problems.push("falta el diseño o modelo");
    if (design && !shirtColor) problems.push("falta el color de la camiseta");
    if (!size) problems.push("falta la talla");

    if (shirtColor && size) {
      const key = `shirt|${colorKey(shirtColor)}|${size}`;
      addToGroup(shirtGroups, { key, kind: "shirt", color: shirtColor, size }, order, shirtColor);
    }

    if (design) {
      const dtf = resolveDtfColor(design, shirtColor, rules);
      if (dtf.color || dtf.unique) {
        const key = `dtf|${normalizeText(design)}|${dtf.unique ? "unico" : colorKey(dtf.color!)}`;
        addToGroup(
          dtfGroups,
          { key, kind: "dtf", design, dtfColor: dtf.color, unique: dtf.unique },
          order,
          shirtColor,
        );
      } else if (shirtColor) {
        const label = shirtColorLabel(shirtColor);
        colorsWithoutRule.set(colorKey(shirtColor), label);
        const key = `dtf|${normalizeText(design)}|?|${colorKey(shirtColor)}`;
        addToGroup(
          dtfGroups,
          { key, kind: "dtf", design, dtfColor: null, missingRuleFor: garmentName(label) },
          order,
          shirtColor,
        );
      }
    }

    if (problems.length > 0) {
      warnings.push({ orderId: order.id, orderRef: orderRef(order), problems });
    }
  }

  const shirts = [...shirtGroups.values()]
    .sort(
      (a, b) =>
        shirtColorLabel(a.color!).localeCompare(shirtColorLabel(b.color!), "es") ||
        sizeRank(a.size!) - sizeRank(b.size!) ||
        a.size!.localeCompare(b.size!, "es"),
    )
    .map<BagLine>((g) => ({
      key: g.key,
      kind: "shirt",
      label: `${capitalize(garmentName(shirtColorLabel(g.color!)))} ${g.size}`,
      quantity: g.quantity,
      sources: g.sources,
    }));

  const dtfs = [...dtfGroups.values()]
    .sort(
      (a, b) =>
        a.design!.localeCompare(b.design!, "es") ||
        (a.dtfColor ?? "").localeCompare(b.dtfColor ?? "", "es"),
    )
    .map<BagLine>((g) => {
      const forShirts = g.shirtColors.length
        ? ` (para ${g.shirtColors.map(garmentName).join(" / ")})`
        : "";
      const color = g.unique ? "" : g.dtfColor ? ` ${g.dtfColor}` : " · color sin definir";
      return {
        key: g.key,
        kind: "dtf",
        label: `DTF ${g.design}${color}${forShirts}`,
        quantity: g.quantity,
        sources: g.sources,
        missingRuleFor: g.missingRuleFor,
      };
    });

  return {
    pendingOrders: orders.length,
    shirts,
    dtfs,
    warnings,
    colorsWithoutRule: [...colorsWithoutRule.values()].sort((a, b) => a.localeCompare(b, "es")),
  };
}

export function printBagToText(bag: Pick<PrintBag, "shirts" | "dtfs">) {
  const total = (lines: BagLine[]) => lines.reduce((sum, l) => sum + l.quantity, 0);
  const block = (lines: BagLine[]) =>
    lines.map((l) => `- ${l.quantity} × ${l.label}`).join("\n");
  const parts = ["🎒 Bolsa para la imprenta"];
  if (bag.shirts.length) {
    parts.push(`\nCamisetas y sudaderas (${total(bag.shirts)}):\n${block(bag.shirts)}`);
  }
  if (bag.dtfs.length) {
    parts.push(`\nDTF (${total(bag.dtfs)}):\n${block(bag.dtfs)}`);
  }
  return parts.join("\n");
}
