import { orderStatusValues } from "./validation";

export type OrderStatus = (typeof orderStatusValues)[number];

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  SIN_HACER: {
    label: "Sin hacer",
    dot: "bg-secondary",
    bg: "bg-secondary/12",
    text: "text-secondary",
  },
  EN_CASA: {
    label: "En casa",
    dot: "bg-accent",
    bg: "bg-accent/12",
    text: "text-accent",
  },
  EN_PAQUETE: {
    label: "En paquete",
    dot: "bg-warning",
    bg: "bg-warning/15",
    text: "text-[#a15c00] dark:text-warning",
  },
  ENVIADO: {
    label: "Enviado",
    dot: "bg-success",
    bg: "bg-success/12",
    text: "text-success",
  },
  SIN_LLEGAR: {
    label: "Sin llegar",
    dot: "bg-[#ec835a]",
    bg: "bg-[#ec835a]/15",
    text: "text-[#b8500f] dark:text-[#ec835a]",
  },
  CANCELADO: {
    label: "Cancelado",
    dot: "bg-danger",
    bg: "bg-danger/12",
    text: "text-danger",
  },
};

export function normalizeOrderStatus(raw: string | null | undefined): OrderStatus {
  const key = (raw ?? "").trim().toUpperCase().replace(/\s+/g, "_");
  return (orderStatusValues as readonly string[]).includes(key)
    ? (key as OrderStatus)
    : "SIN_HACER";
}

export { orderStatusValues };
