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
