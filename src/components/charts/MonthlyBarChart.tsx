"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { chartColors } from "@/lib/chart-theme";
import { formatCurrency } from "@/lib/format";

type MonthPoint = { label: string; ingresos: number; gastos: number };

export function MonthlyBarChart({ data }: { data: MonthPoint[] }) {
  const scheme = useColorScheme();
  const c = chartColors[scheme];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap={20} barGap={4}>
        <CartesianGrid
          vertical={false}
          stroke={c.gridline}
          strokeDasharray="0"
        />
        <XAxis
          dataKey="label"
          axisLine={{ stroke: c.baseline }}
          tickLine={false}
          tick={{ fill: c.muted, fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: c.muted, fontSize: 12 }}
          width={40}
          tickFormatter={(value: number) =>
            value >= 1000 ? `${Math.round(value / 100) / 10}K` : String(value)
          }
        />
        <Tooltip
          cursor={{ fill: c.gridline, opacity: 0.4 }}
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            background: c.surface,
            border: `1px solid ${c.gridline}`,
            borderRadius: 12,
            color: c.textPrimary,
            fontSize: 13,
          }}
          labelStyle={{ color: c.textSecondary, marginBottom: 4 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span style={{ color: c.textSecondary, fontSize: 13 }}>
              {value}
            </span>
          )}
        />
        <Bar
          dataKey="ingresos"
          name="Ingresos"
          fill={c.ingresos}
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
        <Bar
          dataKey="gastos"
          name="Gastos"
          fill={c.gastos}
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
