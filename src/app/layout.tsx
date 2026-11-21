import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Hanken_Grotesk } from "next/font/google";
import Providers from "@/components/Providers";
import { BRAND } from "@/lib/brand";
import { cssVars } from "@/lib/palette";
import "./globals.css";

// Títulos: condensada y pesada, como los números de una camiseta
const display = Big_Shoulders({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Texto: sans humanista, cómoda de leer en el celular
const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} | ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description:
    "Organizá partidos, equipos y formaciones, compartí el link por WhatsApp y construí tu historial de jugador.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E1A3A",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${body.variable}`}
      style={cssVars as CSSProperties}
    >
      <body>
        <div className="stripes" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
