import { IconBox, IconChart, IconHome, IconReceipt, IconTrendUp } from "./icons";

export const navItems = [
  { href: "/", label: "Beneficio", icon: IconHome },
  { href: "/ingresos", label: "Ingresos", icon: IconTrendUp },
  { href: "/gastos", label: "Gastos", icon: IconReceipt },
  { href: "/pedidos", label: "Pedidos", icon: IconBox },
  { href: "/estadisticas", label: "Estadísticas", icon: IconChart },
] as const;
