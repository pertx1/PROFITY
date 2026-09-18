import { orderStatusValues } from "./validation";

export type OrderStatus = (typeof orderStatusValues)[number];

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; dot: string }
> = {
  SIN_HACER: { label: "Sin hacer", dot: "bg-secondary" },
  EN_CASA: { label: "En casa", dot: "bg-accent" },
  EN_PAQUETE: { label: "En paquete", dot: "bg-warning" },
  ENVIADO: { label: "Enviado", dot: "bg-success" },
  SIN_LLEGAR: { label: "Sin llegar", dot: "bg-[#ec835a]" },
  CANCELADO: { label: "Cancelado", dot: "bg-danger" },
};

export function normalizeOrderStatus(raw: string | null | undefined): OrderStatus {
  const key = (raw ?? "").trim().toUpperCase().replace(/\s+/g, "_");
  return (orderStatusValues as readonly string[]).includes(key)
    ? (key as OrderStatus)
    : "SIN_HACER";
}

export { orderStatusValues };
