export const FORMATS = [5, 6, 7, 8, 9, 11] as const;

export const TEAM_COLORS = [
  { name: "Marino", hex: "#0E1A3A" },
  { name: "Celeste", hex: "#75AADB" },
  { name: "Amarillo", hex: "#FFCE1F" },
  { name: "Rojo", hex: "#E5372B" },
  { name: "Verde", hex: "#1E8F4E" },
  { name: "Naranja", hex: "#F28C28" },
  { name: "Violeta", hex: "#6B4FBB" },
  { name: "Grana", hex: "#8C1D40" },
  { name: "Negro", hex: "#111111" },
  { name: "Blanco", hex: "#FFFFFF" },
] as const;

export const VISIBILITY_OPTIONS = [
  { value: "LINK", label: "Solo con el link" },
  { value: "PUBLIC", label: "Cualquiera puede verlo" },
  { value: "PRIVATE", label: "Solo los integrantes" },
] as const;

export const ROLE_LABEL = { CAPTAIN: "Capitán", REGULAR: "Jugador", GUEST: "Invitado" } as const;

// La imagen subida se achica en el navegador a 256 px; este es el tope que acepta el servidor
export const MAX_CREST_CHARS = 280_000;
export const CREST_DATA_URL = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

export const formatLabel = (n: number) => `Fútbol ${n}`;

/** Sigla por defecto: iniciales de las palabras o las primeras letras */
export function defaultShortName(name: string) {
  const words = name.trim().split(/\s+/).filter((w) => w.length > 2 || /^\d/.test(w));
  const initials = words.map((w) => w[0]).join("");
  const raw = initials.length >= 2 ? initials : name.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/g, "");
  return raw.slice(0, 3).toUpperCase();
}
