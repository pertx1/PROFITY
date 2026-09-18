export type TrendSeriesDef = {
  key: string;
  name: string;
  colorKey: "ingresos" | "gastos" | "beneficio";
};

export const trendChartDefs = {
  gastos: {
    title: "Gastos",
    subtitle: "Lo que sale de tu negocio",
    series: [{ key: "gastos", name: "Gastos", colorKey: "gastos" }] as TrendSeriesDef[],
  },
  ingresos: {
    title: "Ingresos",
    subtitle: "Lo que entra por pedidos y otras fuentes",
    series: [{ key: "ingresos", name: "Ingresos", colorKey: "ingresos" }] as TrendSeriesDef[],
  },
  comparativa: {
    title: "Ingresos vs. gastos",
    subtitle: "Los dos a la vez",
    series: [
      { key: "ingresos", name: "Ingresos", colorKey: "ingresos" },
      { key: "gastos", name: "Gastos", colorKey: "gastos" },
    ] as TrendSeriesDef[],
  },
} as const;

export type TrendChartKey = keyof typeof trendChartDefs;

export function isTrendChartKey(value: string): value is TrendChartKey {
  return value in trendChartDefs;
}
