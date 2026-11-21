// Paleta Albiceleste: marino de pizarra, celeste de camiseta y amarillo de tarjeta.
// Para cambiar los colores de toda la app, se editan solo estos valores.
export const palette = {
  // Superficies y texto
  page: "#F2F7FC",
  card: "#FFFFFF",
  text: "#0E1A3A",
  muted: "#4A5878",
  border: "#DCE5F0",
  // Barra lateral
  sidebar: "#0E1A3A",
  sidebarText: "#FFFFFF",
  sidebarMuted: "rgba(234, 240, 255, 0.74)",
  sidebarActive: "#FFCE1F",
  sidebarActiveText: "#0E1A3A",
  sidebarPromo: "rgba(117, 170, 219, 0.16)",
  sidebarStripe: "rgba(117, 170, 219, 0.08)",
  // Acción principal y acentos
  brand: "#FFCE1F",
  brandText: "#0E1A3A",
  brandHover: "#FFD74A",
  accent: "#75AADB",
  navy2: "#1B3A78",
  tint: "#E2EEF9",
  tintText: "#1B3A78",
  // Estados
  okText: "#1B3A78",
  okBg: "#DCEBF9",
  warnText: "#7A5200",
  warnBg: "#FFF0BF",
  badText: "#B3261E",
  badBg: "#FDE2DF",
  neutralBg: "#EAF0F7",
  // Ilustraciones
  heroFrom: "#0E1A3A",
  heroTo: "#1B3A78",
  pitch: "#13275A",
  // Colores de camiseta para los equipos
  team1: "#0E1A3A",
  team1Text: "#FFFFFF",
  team2: "#75AADB",
  team2Text: "#0E1A3A",
  team3: "#FFCE1F",
  team3Text: "#0E1A3A",
} as const;

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

// Variables CSS (--c-page, --c-sidebar-text, ...) para usar como var(--c-xxx)
export const cssVars = Object.fromEntries(
  Object.entries(palette).map(([k, v]) => [`--c-${kebab(k)}`, v])
) as Record<string, string>;
