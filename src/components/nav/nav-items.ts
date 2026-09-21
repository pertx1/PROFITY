import {
  IconChart,
  IconGoat,
  IconHome,
  IconInvoice,
  IconTag,
} from "./icons";

export const navItems = [
  { href: "/", label: "Beneficio", icon: IconHome },
  { href: "/facturas", label: "Facturas", icon: IconInvoice },
  { href: "/akerra", label: "Akerra", icon: IconGoat },
  { href: "/vinted", label: "Vinted", icon: IconTag },
  { href: "/estadisticas", label: "Estadísticas", icon: IconChart },
] as const;
