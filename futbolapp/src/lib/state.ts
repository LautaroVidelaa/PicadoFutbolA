import { prisma } from "@/lib/prisma";

export const ATTRS = [
  { id: "speed", label: "Velocidad" },
  { id: "stamina", label: "Resistencia" },
  { id: "power", label: "Potencia" },
  { id: "technique", label: "Técnica" },
  { id: "defense", label: "Defensa" },
] as const;
export type AttrId = (typeof ATTRS)[number]["id"];

export const STATUS_OPTIONS = [
  { value: "READY", label: "Listo para jugar", short: "Listo", tone: "ok" },
  { value: "MINOR_ISSUE", label: "Con molestias", short: "Con molestias", tone: "warn" },
  { value: "RESTING", label: "Descansando", short: "Descansando", tone: "neutral" },
] as const;
export type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];
export const isStatus = (v: unknown): v is StatusValue => STATUS_OPTIONS.some((s) => s.value === v);

/** Último estado de cada jugador (solo el semáforo, nunca los atributos ni la nota). */
export async function latestStatuses(playerIds: string[]) {
  const out = new Map<string, StatusValue>();
  if (playerIds.length === 0) return out;
  const rows = await prisma.stateEntry.findMany({
    where: { playerId: { in: playerIds } },
    orderBy: { createdAt: "desc" },
    select: { playerId: true, status: true },
  });
  for (const r of rows) if (!out.has(r.playerId)) out.set(r.playerId, r.status);
  return out;
}
