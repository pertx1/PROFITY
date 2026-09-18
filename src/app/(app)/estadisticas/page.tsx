import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getSeriesForRange } from "@/lib/dashboard";
import {
  getOrderStatusBreakdown,
  getTopColors,
  getTopExpenseCategories,
  getTopModelSizes,
  getTopModels,
} from "@/lib/stats";
import { resolveRange } from "@/lib/date-range";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RangeSelector } from "@/components/ui/RangeSelector";
import { TrendAreaChart } from "@/components/charts/TrendAreaChart";
import { RankedBarChart } from "@/components/charts/RankedBarChart";
import { formatDate } from "@/lib/format";
import type { OrderStatus } from "@/lib/order-status";

export const metadata: Metadata = { title: "Estadísticas · PROFITY" };

export default async function EstadisticasPage({
  searchParams,
}: PageProps<"/estadisticas">) {
  const { userId } = await requireUser();
  const params = await searchParams;
  const range = resolveRange({
    range: typeof params.range === "string" ? params.range : undefined,
    from: typeof params.from === "string" ? params.from : undefined,
    to: typeof params.to === "string" ? params.to : undefined,
  });

  const [series, topModels, topModelSizes, topColors, topCategories, statusBreakdown] =
    await Promise.all([
      getSeriesForRange(userId, range.start, range.end),
      getTopModels(userId, range),
      getTopModelSizes(userId, range),
      getTopColors(userId, range),
      getTopExpenseCategories(userId, range),
      getOrderStatusBreakdown(userId, range),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Estadísticas</h1>
        <p className="mt-1 text-sm text-secondary">
          Qué se vende más y en qué se va el dinero.
        </p>
      </div>

      <RangeSelector current={range.key} />
      <p className="-mt-4 text-xs text-secondary">
        {formatDate(range.start)} – {formatDate(range.end)}
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="text-base font-semibold">Gastos</h2>
          <div className="mt-2">
            <TrendAreaChart
              data={series}
              series={[{ key: "gastos", name: "Gastos", colorKey: "gastos" }]}
              height={200}
            />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold">Beneficio</h2>
          <div className="mt-2">
            <TrendAreaChart
              data={series}
              series={[{ key: "beneficio", name: "Beneficio", colorKey: "beneficio" }]}
              height={200}
            />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold">Ingresos vs. gastos</h2>
          <div className="mt-2">
            <TrendAreaChart
              data={series}
              series={[
                { key: "ingresos", name: "Ingresos", colorKey: "ingresos" },
                { key: "gastos", name: "Gastos", colorKey: "gastos" },
              ]}
              height={200}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-base font-semibold">Modelos más vendidos</h2>
          <p className="mt-1 text-sm text-secondary">Unidades vendidas por modelo</p>
          <div className="mt-3">
            <RankedBarChart data={topModels} />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold">Modelo + talla más vendido</h2>
          <p className="mt-1 text-sm text-secondary">Combinación exacta más pedida</p>
          <div className="mt-3">
            <RankedBarChart data={topModelSizes} />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold">Colores más vendidos</h2>
          <p className="mt-1 text-sm text-secondary">Unidades vendidas por color</p>
          <div className="mt-3">
            <RankedBarChart data={topColors} />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold">¿En qué se va el dinero?</h2>
          <p className="mt-1 text-sm text-secondary">Gasto total por categoría</p>
          <div className="mt-3">
            <RankedBarChart data={topCategories} format="currency" />
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Pedidos por estado</h2>
        {statusBreakdown.length === 0 ? (
          <p className="mt-3 text-sm text-secondary">
            No hay pedidos en este rango de fechas.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-3">
            {statusBreakdown.map((s) => (
              <div
                key={s.status}
                className="flex items-center gap-2 rounded-xl border border-border px-3 py-2"
              >
                <StatusBadge status={s.status as OrderStatus} />
                <span className="text-sm font-semibold">{s.count}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
