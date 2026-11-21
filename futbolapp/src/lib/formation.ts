import type { FormationPlayer } from "@/lib/demo";

export type LayoutInput = { id: string; position: string | null; side: "HOME" | "AWAY" | null };

// "split": cada equipo en su mitad (picado). "full": un solo equipo usa toda la cancha.
export type BoardMode = "split" | "full";

const LINE: Record<string, number> = { GK: 0, DEF: 0.33, MID: 0.62, FWD: 0.9, NONE: 0.62 };

/** Posición inicial de cada jugador según su puesto: arquero atrás, delanteros adelante. Valores de 0 a 100. */
export function autoLayout(players: LayoutInput[], mode: BoardMode) {
  const out: Record<string, { x: number; y: number }> = {};
  for (const side of ["HOME", "AWAY"] as const) {
    const mine = players.filter((p) => p.side === side);
    const lines = new Map<number, LayoutInput[]>();
    for (const p of mine) {
      const f = LINE[p.position ?? "NONE"];
      lines.set(f, [...(lines.get(f) ?? []), p]);
    }
    for (const [f, list] of lines) {
      list.forEach((p, i) => {
        const x = mode === "full" ? 9 + f * 82 : side === "HOME" ? 9 + f * 40 : 91 - f * 40;
        out[p.id] = { x, y: 12 + ((i + 1) / (list.length + 1)) * 76 };
      });
    }
  }
  return out;
}

export type BoardSource = {
  id: string;
  firstName: string;
  number: number | null;
  position: string | null;
  side: "HOME" | "AWAY" | null;
  posX: number | null;
  posY: number | null;
  playerId?: string;
  photoVer?: number;
};

/** Para dibujar la cancha de solo lectura: usa lo guardado y completa el resto con la posición automática. */
export function toBoard(players: BoardSource[], mode: BoardMode) {
  const auto = autoLayout(players, mode);
  const map = (side: "HOME" | "AWAY"): FormationPlayer[] =>
    players
      .filter((p) => p.side === side)
      .map((p) => {
        const pos = p.posX != null && p.posY != null ? { x: p.posX, y: p.posY } : auto[p.id];
        return { n: p.number ?? 0, name: p.firstName, x: pos.x / 100, y: pos.y / 100, gk: p.position === "GK", pid: p.playerId, ver: p.photoVer };
      });
  return { home: map("HOME"), away: map("AWAY") };
}

// ---------- Formaciones predeterminadas ----------

export type Formation = { key: string; label: string; lines: number[] };
const f = (lines: number[]): Formation => ({ key: lines.join("-"), label: lines.join("-"), lines });

/** Esquemas conocidos según cuántos juegan por lado (el arquero se cuenta aparte: la suma es jugadores − 1). */
export const FORMATIONS: Record<number, Formation[]> = {
  5: [f([2, 2]), f([1, 2, 1]), f([2, 1, 1]), f([1, 1, 2]), f([3, 1])],
  6: [f([2, 2, 1]), f([2, 1, 2]), f([3, 1, 1]), f([1, 3, 1]), f([3, 2])],
  7: [f([2, 3, 1]), f([3, 2, 1]), f([2, 2, 2]), f([3, 1, 2]), f([1, 3, 2])],
  8: [f([3, 3, 1]), f([3, 2, 2]), f([2, 3, 2]), f([4, 2, 1]), f([2, 4, 1])],
  9: [f([3, 3, 2]), f([3, 4, 1]), f([4, 3, 1]), f([2, 4, 2]), f([3, 2, 3])],
  10: [f([4, 3, 2]), f([3, 4, 2]), f([4, 4, 1]), f([3, 3, 3]), f([5, 3, 1])],
  11: [f([4, 4, 2]), f([4, 3, 3]), f([4, 2, 3, 1]), f([3, 5, 2]), f([5, 3, 2]), f([3, 4, 3]), f([4, 1, 4, 1])],
};

const RANK: Record<string, number> = { GK: 0, DEF: 1, MID: 2, NONE: 2, FWD: 3 };

/**
 * Ubica a los jugadores de un lado según la formación: el arquero atrás y después las líneas de atrás hacia adelante,
 * respetando el puesto de cada uno (defensores primero, delanteros al final). Valores de 0 a 100.
 */
export function layoutFormation(players: { id: string; position: string | null }[], side: "HOME" | "AWAY", lines: number[], mode: BoardMode) {
  const out: Record<string, { x: number; y: number }> = {};
  const gkIdx = players.findIndex((p) => p.position === "GK");
  const keeper = gkIdx >= 0 ? players[gkIdx] : undefined;
  const field = players
    .filter((p) => p !== keeper)
    .sort((a, b) => (RANK[a.position ?? "NONE"] ?? 2) - (RANK[b.position ?? "NONE"] ?? 2));
  const xOf = (fr: number) => (mode === "full" ? 9 + fr * 82 : side === "HOME" ? 9 + fr * 40 : 91 - fr * 40);
  const place = (list: { id: string }[], fr: number) =>
    list.forEach((p, i) => (out[p.id] = { x: xOf(fr), y: 12 + ((i + 1) / (list.length + 1)) * 76 }));
  if (keeper) place([keeper], 0);
  // Si no hay arquero marcado, el primero de la línea más atrás ocupa ese lugar
  const slots = keeper ? lines : lines;
  let i = 0;
  slots.forEach((n, li) => {
    const fr = slots.length === 1 ? 0.6 : 0.33 + (li / (slots.length - 1)) * 0.57;
    const take = li === slots.length - 1 ? field.slice(i) : field.slice(i, i + n);
    i += n;
    place(take, fr);
  });
  return out;
}
