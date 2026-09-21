import {
  IconChart,
  IconGoat,
  IconHome,
  IconTag,
  IconTrendUp,
} from "./icons";

export const navItems = [
  { href: "/", label: "Beneficio", icon: IconHome },
  { href: "/ingresos", label: "Ingresos", icon: IconTrendUp },
  { href: "/akerra", label: "Akerra", icon: IconGoat },
  { href: "/vinted", label: "Vinted", icon: IconTag },
  { href: "/estadisticas", label: "Estadísticas", icon: IconChart },
] as const;
