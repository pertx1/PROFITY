import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getMonthlySeries } from "@/lib/dashboard";
import {
  getOrderStatusBreakdown,
  getTopColors,
  getTopExpenseCategories,
  getTopModelSizes,
  getTopModels,
} from "@/lib/stats";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MonthlyBarChart } from "@/components/charts/MonthlyBarChart";
import { RankedBarChart } from "@/components/charts/RankedBarChart";
import type { OrderStatus } from "@/lib/order-status";

export const metadata: Metadata = { title: "Estadísticas · PROFITY" };

export default async function EstadisticasPage() {
  const { userId } = await requireUser();

  const [series, topModels, topModelSizes, topColors, topCategories, statusBreakdown] =
    await Promise.all([
      getMonthlySeries(userId, 12),
      getTopModels(userId),
      getTopModelSizes(userId),
      getTopColors(userId),
      getTopExpenseCategories(userId),
      getOrderStatusBreakdown(userId),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Estadísticas</h1>
        <p className="mt-1 text-sm text-secondary">
          Qué se vende más y en qué se va el dinero.
        </p>
      </div>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Ingresos vs. gastos (12 meses)</h2>
        <div className="mt-2">
          <MonthlyBarChart data={series} />
        </div>
      </Card>

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
            Todavía no hay pedidos registrados.
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
