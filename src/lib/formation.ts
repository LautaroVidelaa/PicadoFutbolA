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
        const x = mode === "full" ? 6 + f * 86 : side === "HOME" ? 4 + f * 44 : 96 - f * 44;
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
};

/** Para dibujar la cancha de solo lectura: usa lo guardado y completa el resto con la posición automática. */
export function toBoard(players: BoardSource[], mode: BoardMode) {
  const auto = autoLayout(players, mode);
  const map = (side: "HOME" | "AWAY"): FormationPlayer[] =>
    players
      .filter((p) => p.side === side)
      .map((p) => {
        const pos = p.posX != null && p.posY != null ? { x: p.posX, y: p.posY } : auto[p.id];
        return { n: p.number ?? 0, name: p.firstName, x: pos.x / 100, y: pos.y / 100, gk: p.position === "GK" };
      });
  return { home: map("HOME"), away: map("AWAY") };
}
