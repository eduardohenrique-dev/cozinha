import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "cozinha",
    short_name: "cozinha",
    description: "Receitas, calorias, água e despensa — tudo na mesma panela.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAF6F0",
    theme_color: "#FAF6F0",
    lang: "pt-BR",
    categories: ["food", "health", "lifestyle"],
    icons: [
      { src: "/icone.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icone-mascara.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Registrar refeição", url: "/registrar" },
      { name: "Água", url: "/registrar?aba=agua" },
      { name: "Despensa", url: "/despensa" },
    ],
  };
}
