"use client";

import { useEffect, useState } from "react";
import type { ChartColorScheme } from "@/lib/chart-theme";

// Se inicializa en "light" (igual que en el servidor) para evitar un
// desajuste de hidratación; el efecto sincroniza el valor real del
// sistema justo después del primer render.
export function useColorScheme(): ChartColorScheme {
  const [scheme, setScheme] = useState<ChartColorScheme>("light");

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScheme(query.matches ? "dark" : "light");
    const listener = (event: MediaQueryListEvent) =>
      setScheme(event.matches ? "dark" : "light");
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return scheme;
}
