import "server-only";
import { prisma } from "@/lib/prisma";
import {
  DTF_VARIANT_LABELS,
  PAIRED_DTF_DESIGNS,
  STANDALONE_DTF_DESIGNS,
  TSHIRT_MODELS,
  TSHIRT_MODEL_LABELS,
  TSHIRT_SIZES,
  resolveOrderStockEffect,
  type DtfVariant,
  type TshirtModel,
} from "@/lib/stock-catalog";

/** Crea (si no existen) todas las filas de stock posibles para el usuario, en 0. */
export async function ensureStockRows(userId: string) {
  const tshirtRows = TSHIRT_MODELS.flatMap((model) =>
    TSHIRT_SIZES.map((size) => ({ userId, model, size })),
  );
  const dtfRows = [
    ...STANDALONE_DTF_DESIGNS.map((name) => ({ userId, name, variant: "UNICO" as const })),
    ...PAIRED_DTF_DESIGNS.flatMap((name) => [
      { userId, name, variant: "BLANCO" as const },
      { userId, name, variant: "NEGRO" as const },
    ]),
  ];

  await Promise.all([
    prisma.tshirtStock.createMany({ data: tshirtRows, skipDuplicates: true }),
    prisma.dtfStock.createMany({ data: dtfRows, skipDuplicates: true }),
  ]);
}

// Solo los pedidos que todavía necesitan camiseta/DTF físicamente restan
// stock: sin hacer (falta producirlo) y sin llegar (pedido pero no ha
// llegado). En casa, en paquete y enviado ya se hicieron con stock que se
// descontó en su momento a mano, y cancelado no consume nada.
const STATUSES_THAT_CONSUME_STOCK: ("SIN_HACER" | "SIN_LLEGAR")[] = ["SIN_HACER", "SIN_LLEGAR"];

/**
 * Cuánto stock reservan ahora mismo los pedidos pendientes (sin hacer o sin
 * llegar), comparando el modelo/color/talla de cada pedido con el catálogo
 * de camisetas y DTF. Esto es lo único que resta stock: un pedido "sin
 * hacer" ya cuenta, tanto si lo acabas de añadir como si llevaba tiempo ahí.
 */
async function getOrderDemand(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId, status: { in: STATUSES_THAT_CONSUME_STOCK } },
    select: { model: true, color: true, size: true, quantity: true },
  });

  const tshirtDemand = new Map<string, number>();
  const dtfDemand = new Map<string, number>();

  for (const order of orders) {
    const effect = resolveOrderStockEffect(order);
    if (effect.tshirt) {
      const key = `${effect.tshirt.model}_${effect.tshirt.size}`;
      tshirtDemand.set(key, (tshirtDemand.get(key) ?? 0) + order.quantity);
    }
    if (effect.dtf) {
      const key = `${effect.dtf.name}_${effect.dtf.variant}`;
      dtfDemand.set(key, (dtfDemand.get(key) ?? 0) + order.quantity);
    }
  }

  return { tshirtDemand, dtfDemand };
}

export async function getStockOverview(userId: string) {
  await ensureStockRows(userId);

  const [tshirtRows, dtfRows, { tshirtDemand, dtfDemand }] = await Promise.all([
    prisma.tshirtStock.findMany({
      where: { userId },
      orderBy: [{ model: "asc" }, { size: "asc" }],
    }),
    prisma.dtfStock.findMany({
      where: { userId },
      orderBy: [{ name: "asc" }, { variant: "asc" }],
    }),
    getOrderDemand(userId),
  ]);

  // La cantidad "de verdad" es lo que tienes hecho/comprado menos lo que
  // piden tus pedidos activos ahora mismo. Puede ser negativa.
  const tshirtStocks = tshirtRows.map((s) => ({
    ...s,
    quantity: s.quantity - (tshirtDemand.get(`${s.model}_${s.size}`) ?? 0),
  }));
  const dtfStocks = dtfRows.map((s) => ({
    ...s,
    quantity: s.quantity - (dtfDemand.get(`${s.name}_${s.variant}`) ?? 0),
  }));

  const needsOrder = [
    ...tshirtStocks
      .filter((s) => s.quantity <= 0)
      .map((s) => ({
        key: `tshirt-${s.model}-${s.size}`,
        label: `Camiseta ${TSHIRT_MODEL_LABELS[s.model as TshirtModel]} · talla ${s.size}`,
        quantity: s.quantity,
      })),
    ...dtfStocks
      .filter((s) => s.quantity <= 0)
      .map((s) => ({
        key: `dtf-${s.name}-${s.variant}`,
        label:
          s.variant === "UNICO"
            ? `DTF ${s.name}`
            : `${s.name} · ${DTF_VARIANT_LABELS[s.variant as DtfVariant]}`,
        quantity: s.quantity,
      })),
  ].sort((a, b) => a.quantity - b.quantity);

  const tshirtTotal = tshirtStocks.reduce((sum, s) => sum + s.quantity, 0);
  const dtfTotal = dtfStocks.reduce((sum, s) => sum + s.quantity, 0);

  return { tshirtStocks, dtfStocks, needsOrder, tshirtTotal, dtfTotal };
}

/** Ajusta el stock base (lo que tienes hecho/comprado), antes de restar pedidos. */
export async function adjustTshirtStock(
  userId: string,
  model: TshirtModel,
  size: string,
  delta: number,
) {
  await prisma.tshirtStock.upsert({
    where: { userId_model_size: { userId, model, size } },
    update: { quantity: { increment: delta } },
    create: { userId, model, size, quantity: delta },
  });
}

/** Ajusta el stock base (lo que tienes hecho/comprado), antes de restar pedidos. */
export async function adjustDtfStock(
  userId: string,
  name: string,
  variant: DtfVariant,
  delta: number,
) {
  await prisma.dtfStock.upsert({
    where: { userId_name_variant: { userId, name, variant } },
    update: { quantity: { increment: delta } },
    create: { userId, name, variant, quantity: delta },
  });
}
