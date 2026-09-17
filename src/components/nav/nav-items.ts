import { IconBox, IconChart, IconHome, IconReceipt } from "./icons";

export const navItems = [
  { href: "/", label: "Beneficio", icon: IconHome },
  { href: "/gastos", label: "Gastos", icon: IconReceipt },
  { href: "/pedidos", label: "Pedidos", icon: IconBox },
  { href: "/estadisticas", label: "Estadísticas", icon: IconChart },
] as const;
