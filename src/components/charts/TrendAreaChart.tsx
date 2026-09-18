"use client";

import {
  Area,
  AreaChart,
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

type TrendPoint = Record<string, number | string>;
type Series = { key: string; name: string; colorKey: "ingresos" | "gastos" | "beneficio" };

export function TrendAreaChart({
  data,
  series,
  height = 240,
}: {
  data: TrendPoint[];
  series: Series[];
  height?: number;
}) {
  const scheme = useColorScheme();
  const c = chartColors[scheme];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c[s.colorKey]} stopOpacity={0.28} />
              <stop offset="100%" stopColor={c[s.colorKey]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} stroke={c.gridline} strokeDasharray="0" />
        <XAxis
          dataKey="label"
          axisLine={{ stroke: c.baseline }}
          tickLine={false}
          tick={{ fill: c.muted, fontSize: 12 }}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: c.muted, fontSize: 12 }}
          width={44}
          tickFormatter={(value: number) =>
            Math.abs(value) >= 1000 ? `${Math.round(value / 100) / 10}K` : String(value)
          }
        />
        <Tooltip
          cursor={{ stroke: c.baseline, strokeWidth: 1 }}
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
        {series.length > 1 && (
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span style={{ color: c.textSecondary, fontSize: 13 }}>{value}</span>
            )}
          />
        )}
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={c[s.colorKey]}
            strokeWidth={2}
            fill={`url(#fill-${s.key})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: c.surface }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
