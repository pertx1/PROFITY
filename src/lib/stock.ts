import "server-only";
import { prisma } from "@/lib/prisma";
import {
  DTF_VARIANT_LABELS,
  PAIRED_DTF_DESIGNS,
  STANDALONE_DTF_DESIGNS,
  TSHIRT_MODELS,
  TSHIRT_MODEL_LABELS,
  TSHIRT_SIZES,
  isStandaloneDesign,
  pairedVariantForModel,
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

export async function getStockOverview(userId: string) {
  await ensureStockRows(userId);

  const [tshirtStocks, dtfStocks] = await Promise.all([
    prisma.tshirtStock.findMany({ where: { userId }, orderBy: [{ model: "asc" }, { size: "asc" }] }),
    prisma.dtfStock.findMany({ where: { userId }, orderBy: [{ name: "asc" }, { variant: "asc" }] }),
  ]);

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

export async function registerProduction(
  userId: string,
  {
    model,
    size,
    quantity,
    designName,
  }: { model: TshirtModel; size: string; quantity: number; designName?: string },
) {
  await prisma.$transaction(async (tx) => {
    await tx.tshirtStock.upsert({
      where: { userId_model_size: { userId, model, size } },
      update: { quantity: { decrement: quantity } },
      create: { userId, model, size, quantity: -quantity },
    });

    if (!designName) return;

    const variant: DtfVariant | null = isStandaloneDesign(designName)
      ? "UNICO"
      : pairedVariantForModel(model);

    // Un diseño emparejado sobre un modelo sin pareja (p. ej. fútbol) no descuenta DTF.
    if (!variant) return;

    await tx.dtfStock.upsert({
      where: { userId_name_variant: { userId, name: designName, variant } },
      update: { quantity: { decrement: quantity } },
      create: { userId, name: designName, variant, quantity: -quantity },
    });
  });
}

/**
 * Descuenta (o repone) el stock que corresponde a un pedido, a partir de su
 * modelo/color/talla. `direction: "consume"` se usa al crear un pedido o al
 * aplicar sus valores nuevos en una edición; `"restore"` al borrar un pedido
 * o al deshacer sus valores antiguos antes de aplicar los nuevos.
 */
export async function applyOrderStockEffect(
  userId: string,
  order: { model: string; color?: string | null; size?: string | null; quantity: number },
  direction: "consume" | "restore",
) {
  const effect = resolveOrderStockEffect(order);
  if (!effect.tshirt && !effect.dtf) return;

  const sign = direction === "consume" ? -1 : 1;
  const delta = order.quantity * sign;

  await prisma.$transaction(async (tx) => {
    if (effect.tshirt) {
      await tx.tshirtStock.upsert({
        where: {
          userId_model_size: { userId, model: effect.tshirt.model, size: effect.tshirt.size },
        },
        update: { quantity: { increment: delta } },
        create: { userId, model: effect.tshirt.model, size: effect.tshirt.size, quantity: delta },
      });
    }
    if (effect.dtf) {
      await tx.dtfStock.upsert({
        where: {
          userId_name_variant: { userId, name: effect.dtf.name, variant: effect.dtf.variant },
        },
        update: { quantity: { increment: delta } },
        create: { userId, name: effect.dtf.name, variant: effect.dtf.variant, quantity: delta },
      });
    }
  });
}
