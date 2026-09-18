import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PROFITY",
    short_name: "PROFITY",
    description: "Gastos, pedidos y beneficio de tu negocio, siempre a mano.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f7",
    theme_color: "#0071e3",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
