import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getStockOverview } from "@/lib/stock";
import { PAIRED_DTF_DESIGNS, STANDALONE_DTF_DESIGNS } from "@/lib/stock-catalog";
import { Card } from "@/components/ui/Card";
import { StockCell } from "@/components/stock/StockCell";
import { IconChevronRight } from "@/components/nav/icons";
import { adjustDtfStockAction } from "../actions";

export const metadata: Metadata = { title: "DTF · Stock · PROFITY" };

export default async function DtfStockPage() {
  const { userId } = await requireUser();
  const { dtfStocks } = await getStockOverview(userId);

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
        <h1 className="mt-2 text-[34px] font-bold leading-[41px] tracking-tight">DTF</h1>
        <p className="mt-1 text-sm text-secondary">
          Diseños individuales y diseños con versión blanco/negro según la camiseta.
        </p>
      </div>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Diseños individuales</h2>
        <p className="mt-1 text-xs text-secondary">No dependen del color de camiseta.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STANDALONE_DTF_DESIGNS.map((name) => {
            const stock = dtfStocks.find((s) => s.name === name && s.variant === "UNICO");
            return (
              <StockCell
                key={name}
                label={name}
                quantity={stock?.quantity ?? 0}
                action={adjustDtfStockAction}
                hidden={{ name, variant: "UNICO" }}
              />
            );
          })}
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        {PAIRED_DTF_DESIGNS.map((name) => {
          const blanco = dtfStocks.find((s) => s.name === name && s.variant === "BLANCO");
          const negro = dtfStocks.find((s) => s.name === name && s.variant === "NEGRO");
          return (
            <Card key={name} className="p-5">
              <h2 className="text-base font-semibold">{name}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <StockCell
                  label="DTF blanco"
                  sublabel="para camiseta negra"
                  quantity={blanco?.quantity ?? 0}
                  action={adjustDtfStockAction}
                  hidden={{ name, variant: "BLANCO" }}
                />
                <StockCell
                  label="DTF negro"
                  sublabel="para camiseta blanca"
                  quantity={negro?.quantity ?? 0}
                  action={adjustDtfStockAction}
                  hidden={{ name, variant: "NEGRO" }}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
