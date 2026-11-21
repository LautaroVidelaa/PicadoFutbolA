// Fechas siempre en hora argentina: la app es para fútbol de acá y así el servidor
// (que puede estar en otro huso) muestra lo mismo que ve el usuario.
export const APP_TZ = "America/Argentina/Buenos_Aires";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function parts(d: Date, opts: Intl.DateTimeFormatOptions) {
  const out: Record<string, string> = {};
  for (const p of new Intl.DateTimeFormat("es-AR", { timeZone: APP_TZ, ...opts }).formatToParts(d)) out[p.type] = p.value;
  return out;
}

/** "Sáb 14 nov" */
export function dayShort(d: Date) {
  const p = parts(d, { weekday: "short", day: "numeric", month: "short" });
  return `${cap(p.weekday.replace(".", ""))} ${p.day} ${p.month.replace(".", "")}`;
}

/** "Sábado 14 de noviembre" */
export function dayLong(d: Date) {
  const p = parts(d, { weekday: "long", day: "numeric", month: "long" });
  return `${cap(p.weekday)} ${p.day} de ${p.month}`;
}

/** "20:00" */
export function timeOf(d: Date) {
  const p = parts(d, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return `${p.hour}:${p.minute}`;
}

const dayKey = (d: Date) => {
  const p = parts(d, { year: "numeric", month: "2-digit", day: "2-digit" });
  return Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day)) / 86_400_000;
};

/** "Hoy", "Mañana", "En 3 días", "Ayer", "Hace 2 días" */
export function relativeDay(d: Date, now = new Date()) {
  const diff = dayKey(d) - dayKey(now);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff === -1) return "Ayer";
  return diff > 0 ? `En ${diff} días` : `Hace ${-diff} días`;
}

/** Convierte "2026-11-20" + "20:00" (hora del navegador) a un instante real.
 *  offsetMin es Date.getTimezoneOffset() del navegador (Argentina = 180). */
export function parsePlayedAt(date: string, time: string, offsetMin: number): Date | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!d || !t) return null;
  const ms = Date.UTC(+d[1], +d[2] - 1, +d[3], +t[1], +t[2]) + offsetMin * 60_000;
  const out = new Date(ms);
  return Number.isNaN(out.getTime()) ? null : out;
}

export const ATTENDANCE_LABEL = { CONFIRMED: "Confirmado", PENDING: "Pendiente", DECLINED: "No va" } as const;
export const ATTENDANCE_TONE = { CONFIRMED: "ok", PENDING: "warn", DECLINED: "bad" } as const;

export type MatchView = {
  id: string;
  playedAt: Date;
  venue: string | null;
  format: number;
  home: { name: string; preset: string | null; url: string | null; color: string };
  away: { name: string; preset: string | null; url: string | null; color: string };
  confirmed: number;
  needed: number;
  finished: boolean;
  past: boolean;
  score: [number, number] | null;
};
