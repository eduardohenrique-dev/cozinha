import type { Metadata, Viewport } from "next";
import { fraunces, generalSans } from "./fonts";
import { Nav } from "@/components/Nav";
import { Toaster } from "@/components/Toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "cozinha",
  description: "Receitas, calorias, água e despensa — tudo na mesma panela.",
  applicationName: "cozinha",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icone.svg", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
    ],
    apple: "/icone-192.png",
  },
  appleWebApp: { capable: true, title: "cozinha", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#faf6f0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${generalSans.variable}`}>
      <body>
        <Nav />
        <main className="mx-auto w-full max-w-shell px-5 pb-32 pt-6 md:px-8 md:pb-20 md:pt-10">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
