import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getSeriesForRange } from "@/lib/dashboard";
import { resolveRange } from "@/lib/date-range";
import { isTrendChartKey, trendChartDefs } from "@/lib/chart-defs";
import { Card } from "@/components/ui/Card";
import { RangeSelector } from "@/components/ui/RangeSelector";
import { TrendAreaChart } from "@/components/charts/TrendAreaChart";
import { IconChevronRight } from "@/components/nav/icons";
import { formatCurrency, formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: PageProps<"/estadisticas/[chart]">): Promise<Metadata> {
  const { chart } = await params;
  const def = isTrendChartKey(chart) ? trendChartDefs[chart] : null;
  return { title: def ? `${def.title} · PROFITY` : "Estadísticas · PROFITY" };
}

export default async function ChartDetailPage({
  params,
  searchParams,
}: PageProps<"/estadisticas/[chart]">) {
  const { userId } = await requireUser();
  const { chart } = await params;

  if (!isTrendChartKey(chart)) {
    notFound();
  }
  const def = trendChartDefs[chart];

  const sp = await searchParams;
  const range = resolveRange({
    range: typeof sp.range === "string" ? sp.range : undefined,
    from: typeof sp.from === "string" ? sp.from : undefined,
    to: typeof sp.to === "string" ? sp.to : undefined,
  });

  const series = await getSeriesForRange(userId, range.start, range.end);
  const totals = def.series.map((s) => ({
    ...s,
    total: series.reduce(
      (sum, point) => sum + (Number(point[s.key as keyof typeof point]) || 0),
      0,
    ),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/estadisticas"
          className="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:text-foreground"
        >
          <IconChevronRight className="h-3.5 w-3.5 rotate-180" />
          Estadísticas
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{def.title}</h1>
        <p className="mt-1 text-sm text-secondary">{def.subtitle}</p>
      </div>

      <RangeSelector current={range.key} />
      <p className="-mt-4 text-xs text-secondary">
        {formatDate(range.start)} – {formatDate(range.end)}
      </p>

      <Card className="p-5">
        <div className="flex flex-wrap gap-6">
          {totals.map((t) => (
            <div key={t.key}>
              <p className="text-sm text-secondary">{t.name}</p>
              <p className="text-2xl font-semibold tracking-tight">
                {formatCurrency(t.total)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <TrendAreaChart data={series} series={def.series} height={360} />
        </div>
      </Card>
    </div>
  );
}
