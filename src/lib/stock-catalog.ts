// Catálogo de stock: camisetas y diseños DTF. Sin dependencias de servidor,
// para poder usarse tanto en componentes de servidor como de cliente.

export const TSHIRT_SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export type TshirtSize = (typeof TSHIRT_SIZES)[number];

export type TshirtModel = "BLANCA" | "NEGRA" | "FUTBOL";
export const TSHIRT_MODELS: TshirtModel[] = ["BLANCA", "NEGRA", "FUTBOL"];

export const TSHIRT_MODEL_LABELS: Record<TshirtModel, string> = {
  BLANCA: "Blanca",
  NEGRA: "Negra",
  FUTBOL: "Fútbol",
};

export type DtfVariant = "UNICO" | "BLANCO" | "NEGRO";

// Diseños DTF que no dependen del color de camiseta (una sola variante).
export const STANDALONE_DTF_DESIGNS = ["BA Azul", "BA blanco", "BA amarillo", "BA negro"];

// Diseños DTF que existen en blanco (para camiseta negra) y negro (para camiseta blanca).
export const PAIRED_DTF_DESIGNS = [
  "Gaztelugatxe",
  "Omako basoa",
  "Flysch",
  "Ujue",
  "Haizearen orrazia",
];

export const ALL_DTF_DESIGNS = [...STANDALONE_DTF_DESIGNS, ...PAIRED_DTF_DESIGNS];

export const DTF_VARIANT_LABELS: Record<DtfVariant, string> = {
  UNICO: "",
  BLANCO: "DTF blanco · para camiseta negra",
  NEGRO: "DTF negro · para camiseta blanca",
};

/** Variante de DTF que se descuenta al estampar un diseño emparejado sobre un modelo de camiseta. */
export function pairedVariantForModel(model: TshirtModel): DtfVariant | null {
  if (model === "NEGRA") return "BLANCO";
  if (model === "BLANCA") return "NEGRO";
  return null;
}

export function isStandaloneDesign(name: string) {
  return STANDALONE_DTF_DESIGNS.includes(name);
}

/** Diseños que tiene sentido ofrecer al registrar producción para un modelo dado. */
export function availableDesignsForModel(model: TshirtModel | ""): string[] {
  if (!model) return ALL_DTF_DESIGNS;
  if (pairedVariantForModel(model)) return ALL_DTF_DESIGNS;
  return STANDALONE_DTF_DESIGNS;
}

function normalizeStockText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toUpperCase();
}

/** Reconoce "Blanca"/"Blanco"/"Negra"/"Negro"/"Fútbol"… venga de donde venga (modelo o color de un pedido). */
export function resolveShirtModel(value: string | null | undefined): TshirtModel | null {
  if (!value) return null;
  const n = normalizeStockText(value);
  if (n === "BLANCA" || n === "BLANCO" || n === "WHITE") return "BLANCA";
  if (n === "NEGRA" || n === "NEGRO" || n === "BLACK") return "NEGRA";
  if (n.includes("FUTBOL")) return "FUTBOL";
  return null;
}

export function resolveTshirtSize(value: string | null | undefined): TshirtSize | null {
  if (!value) return null;
  const n = normalizeStockText(value);
  return (TSHIRT_SIZES as readonly string[]).includes(n) ? (n as TshirtSize) : null;
}

export function resolveDtfDesign(value: string | null | undefined): string | null {
  if (!value) return null;
  const n = normalizeStockText(value);
  return ALL_DTF_DESIGNS.find((design) => normalizeStockText(design) === n) ?? null;
}

export type OrderStockEffect = {
  tshirt?: { model: TshirtModel; size: TshirtSize };
  dtf?: { name: string; variant: DtfVariant };
};

/**
 * A partir del modelo/color/talla escritos en un pedido, decide qué hay que
 * descontar del stock: una camiseta blanca/negra/fútbol en una talla, y si el
 * "modelo" es en realidad un diseño DTF, también el DTF correspondiente
 * (variante blanco/negro según el color de la camiseta, o única si el
 * diseño no depende del color).
 */
export function resolveOrderStockEffect(order: {
  model: string;
  color?: string | null;
  size?: string | null;
}): OrderStockEffect {
  const effect: OrderStockEffect = {};
  const size = resolveTshirtSize(order.size);

  const design = resolveDtfDesign(order.model);
  if (design) {
    const shirtModel = resolveShirtModel(order.color);
    if (shirtModel && size) {
      effect.tshirt = { model: shirtModel, size };
    }
    if (isStandaloneDesign(design)) {
      effect.dtf = { name: design, variant: "UNICO" };
    } else if (shirtModel) {
      const variant = pairedVariantForModel(shirtModel);
      if (variant) effect.dtf = { name: design, variant };
    }
    return effect;
  }

  const shirtModel = resolveShirtModel(order.model) ?? resolveShirtModel(order.color);
  if (shirtModel && size) {
    effect.tshirt = { model: shirtModel, size };
  }
  return effect;
}
