import Link from "next/link";
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
import { resolveRange, type RangeKey } from "@/lib/date-range";
import { trendChartDefs } from "@/lib/chart-defs";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RangeSelector } from "@/components/ui/RangeSelector";
import { TrendAreaChart } from "@/components/charts/TrendAreaChart";
import { RankedBarChart } from "@/components/charts/RankedBarChart";
import { IconChevronRight } from "@/components/nav/icons";
import { formatDate } from "@/lib/format";
import type { OrderStatus } from "@/lib/order-status";

function chartHref(key: string, range: RangeKey, from?: string, to?: string) {
  if (range === "custom" && from && to) {
    return `/estadisticas/${key}?range=custom&from=${from}&to=${to}`;
  }
  return `/estadisticas/${key}?range=${range}`;
}

export const metadata: Metadata = { title: "Estadísticas · PROFITY" };

export default async function EstadisticasPage({
  searchParams,
}: PageProps<"/estadisticas">) {
  const { userId } = await requireUser();
  const params = await searchParams;
  const fromParam = typeof params.from === "string" ? params.from : undefined;
  const toParam = typeof params.to === "string" ? params.to : undefined;
  const range = resolveRange({
    range: typeof params.range === "string" ? params.range : undefined,
    from: fromParam,
    to: toParam,
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
        {(Object.entries(trendChartDefs) as [keyof typeof trendChartDefs, (typeof trendChartDefs)[keyof typeof trendChartDefs]][]).map(
          ([key, def]) => (
            <Link
              key={key}
              href={chartHref(key, range.key, fromParam, toParam)}
              className="block"
            >
              <Card className="p-5 transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">{def.title}</h2>
                  <IconChevronRight className="h-4 w-4 text-secondary" />
                </div>
                <div className="mt-2">
                  <TrendAreaChart data={series} series={def.series} height={200} />
                </div>
              </Card>
            </Link>
          ),
        )}
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
