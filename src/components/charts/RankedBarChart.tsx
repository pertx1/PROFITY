"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { chartColors } from "@/lib/chart-theme";
import { formatCurrency } from "@/lib/format";

type RankedPoint = { label: string; value: number };

export function RankedBarChart({
  data,
  format: formatKind = "number",
}: {
  data: RankedPoint[];
  format?: "number" | "currency";
}) {
  const scheme = useColorScheme();
  const c = chartColors[scheme];
  const format =
    formatKind === "currency" ? formatCurrency : (value: number) => String(value);
  const height = Math.max(120, data.length * 36 + 20);

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-secondary">
        Todavía no hay datos suficientes.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} stroke={c.gridline} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          axisLine={false}
          tickLine={false}
          width={140}
          tick={{ fill: c.textSecondary, fontSize: 13 }}
        />
        <Tooltip
          cursor={{ fill: c.gridline, opacity: 0.4 }}
          formatter={(value) => format(Number(value))}
          contentStyle={{
            background: c.surface,
            border: `1px solid ${c.gridline}`,
            borderRadius: 12,
            color: c.textPrimary,
            fontSize: 13,
          }}
          labelStyle={{ color: c.textSecondary, marginBottom: 4 }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {data.map((entry) => (
            <Cell key={entry.label} fill={c.ingresos} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
