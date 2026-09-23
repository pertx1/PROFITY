import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getStockOverview } from "@/lib/stock";
import { TSHIRT_MODEL_LABELS, type TshirtModel } from "@/lib/stock-catalog";
import { Card } from "@/components/ui/Card";
import { StockCell } from "@/components/stock/StockCell";
import { IconChevronRight } from "@/components/nav/icons";
import { adjustTshirtStockAction } from "../actions";

export const metadata: Metadata = { title: "Camisetas · Stock · PROFITY" };

export default async function CamisetasStockPage() {
  const { userId } = await requireUser();
  const { tshirtStocks } = await getStockOverview(userId);

  const models = Array.from(new Set(tshirtStocks.map((s) => s.model))) as TshirtModel[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/stock"
          className="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:text-accent"
        >
          <IconChevronRight className="h-4 w-4 rotate-180" />
          Stock
        </Link>
        <h1 className="mt-2 text-[34px] font-bold leading-[41px] tracking-tight">Camisetas</h1>
        <p className="mt-1 text-sm text-secondary">
          Blancas, negras y de fútbol, por talla. Añade o quita unidades directamente.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {models.map((model) => (
          <Card key={model} className="p-5">
            <h2 className="text-base font-semibold">{TSHIRT_MODEL_LABELS[model]}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {tshirtStocks
                .filter((s) => s.model === model)
                .map((s) => (
                  <StockCell
                    key={s.id}
                    label={`Talla ${s.size}`}
                    quantity={s.quantity}
                    action={adjustTshirtStockAction}
                    hidden={{ model: s.model, size: s.size }}
                  />
                ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
