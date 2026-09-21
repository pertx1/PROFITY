import {
  IconBox,
  IconChart,
  IconGoat,
  IconHome,
  IconLayers,
  IconReceipt,
  IconTrendUp,
} from "./icons";

export const navItems = [
  { href: "/", label: "Beneficio", icon: IconHome },
  { href: "/ingresos", label: "Ingresos", icon: IconTrendUp },
  { href: "/gastos", label: "Gastos", icon: IconReceipt },
  { href: "/pedidos", label: "Pedidos", icon: IconBox },
  { href: "/stock", label: "Stock", icon: IconLayers },
  { href: "/akerra", label: "Akerra", icon: IconGoat },
  { href: "/estadisticas", label: "Estadísticas", icon: IconChart },
] as const;
