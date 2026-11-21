export type Position = "GK" | "DEF" | "MID" | "FWD";

export const POSITIONS: { value: Position; label: string; short: string }[] = [
  { value: "GK", label: "Arquero", short: "ARQ" },
  { value: "DEF", label: "Defensor", short: "DEF" },
  { value: "MID", label: "Mediocampista", short: "MED" },
  { value: "FWD", label: "Delantero", short: "DEL" },
];

export const isPosition = (v: unknown): v is Position =>
  POSITIONS.some((p) => p.value === v);
