export type Position = "GK" | "DEF" | "MID" | "FWD";

export const POSITIONS: { value: Position; label: string; short: string }[] = [
  { value: "GK", label: "Arquero", short: "ARQ" },
  { value: "DEF", label: "Defensor", short: "DEF" },
  { value: "MID", label: "Mediocampista", short: "MED" },
  { value: "FWD", label: "Delantero", short: "DEL" },
];

export const isPosition = (v: unknown): v is Position =>
  POSITIONS.some((p) => p.value === v);

/** Marca que cambia cuando cambia la foto: se agrega a la URL para que el navegador no muestre una foto vieja. */
export function photoVer(photo: string | null | undefined): number {
  if (!photo) return 0;
  let h = photo.length;
  for (let i = 0; i < photo.length; i += Math.max(1, Math.floor(photo.length / 64))) h = (h * 31 + photo.charCodeAt(i)) | 0;
  return Math.abs(h) + 1;
}
