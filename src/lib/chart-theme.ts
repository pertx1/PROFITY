export const chartColors = {
  light: {
    surface: "#fcfcfb",
    textPrimary: "#0b0b0b",
    textSecondary: "#52514e",
    muted: "#898781",
    gridline: "#e1e0d9",
    baseline: "#c3c2b7",
    ingresos: "#2a78d6",
    gastos: "#e34948",
    beneficio: "#1f9d55",
  },
  dark: {
    surface: "#1a1a19",
    textPrimary: "#ffffff",
    textSecondary: "#c3c2b7",
    muted: "#898781",
    gridline: "#2c2c2a",
    baseline: "#383835",
    ingresos: "#3987e5",
    gastos: "#e66767",
    beneficio: "#32d74b",
  },
} as const;

export type ChartColorScheme = keyof typeof chartColors;
