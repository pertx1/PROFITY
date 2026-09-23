import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getStockOverview } from "@/lib/stock";
import {
  PAIRED_DTF_DESIGNS,
  STANDALONE_DTF_DESIGNS,
  TSHIRT_MODELS,
  TSHIRT_MODEL_LABELS,
  type TshirtModel,
} from "@/lib/stock-catalog";
import { Card } from "@/components/ui/Card";
import { IconBox, IconChevronRight } from "@/components/nav/icons";
import { NeedsOrderPanel } from "@/components/stock/NeedsOrderPanel";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Stock · PROFITY" };

export default async function StockPage() {
  const { userId } = await requireUser();
  const { tshirtStocks, dtfStocks, needsOrder, tshirtTotal, dtfTotal } =
    await getStockOverview(userId);

  const tshirtByModel = TSHIRT_MODELS.map((model) => ({
    model,
    total: tshirtStocks
      .filter((s) => s.model === model)
      .reduce((sum, s) => sum + s.quantity, 0),
    low: tshirtStocks.some((s) => s.model === model && s.quantity <= 0),
  }));

  const standaloneTotal = dtfStocks
    .filter((s) => STANDALONE_DTF_DESIGNS.includes(s.name))
    .reduce((sum, s) => sum + s.quantity, 0);
  const pairedTotal = dtfStocks
    .filter((s) => PAIRED_DTF_DESIGNS.includes(s.name))
    .reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[34px] font-bold leading-[41px] tracking-tight">Stock</h1>
        <p className="mt-1 text-sm text-secondary">
          Camisetas y DTF disponibles, siempre al día.
        </p>
      </div>

      <NeedsOrderPanel items={needsOrder} />

      <Card className="flex items-start gap-3 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-accent text-white shadow-sm">
          <IconBox className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">Esto se descuenta solo</h2>
          <p className="mt-1 text-sm text-secondary">
            Cada pedido en estado &quot;Sin hacer&quot; o &quot;Sin llegar&quot;
            resta su camiseta (y su DTF, si el modelo es un diseño) de aquí
            abajo. En casa, en paquete, enviado y cancelado no restan, porque
            ese stock ya se descontó a mano cuando lo hiciste. No hace falta
            registrar nada aparte: se compara directamente con tu página de
            Pedidos. Usa los botones −/+ de cada talla o diseño para decir
            cuánto tienes hecho o comprado.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link href="/stock/camisetas" className="block">
          <Card className="p-5 transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Camisetas en stock</h2>
                <p className="mt-1 text-sm text-secondary">
                  {tshirtTotal} {tshirtTotal === 1 ? "unidad" : "unidades"} en total
                </p>
              </div>
              <IconChevronRight className="h-4 w-4 shrink-0 text-secondary" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {tshirtByModel.map(({ model, total, low }: { model: TshirtModel; total: number; low: boolean }) => (
                <div
                  key={model}
                  className={cn(
                    "rounded-xl border p-3 text-center",
                    low ? "border-danger/40 bg-danger/5" : "border-border bg-background",
                  )}
                >
                  <p className="text-xs font-medium text-secondary">
                    {TSHIRT_MODEL_LABELS[model]}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xl font-semibold tabular-nums",
                      low ? "text-danger" : "text-foreground",
                    )}
                  >
                    {total}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </Link>

        <Link href="/stock/dtf" className="block">
          <Card className="p-5 transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">DTF en stock</h2>
                <p className="mt-1 text-sm text-secondary">
                  {dtfTotal} {dtfTotal === 1 ? "unidad" : "unidades"} en total
                </p>
              </div>
              <IconChevronRight className="h-4 w-4 shrink-0 text-secondary" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-border bg-background p-3 text-center">
                <p className="text-xs font-medium text-secondary">BA (4 diseños)</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{standaloneTotal}</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3 text-center">
                <p className="text-xs font-medium text-secondary">Emparejados (5 diseños)</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{pairedTotal}</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
