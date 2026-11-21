"use client";

import { useActionState, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { saveFormationAction } from "@/app/actions/matches";
import { autoLayout, type BoardMode } from "@/lib/formation";

const W = 600;
const H = 360;

export type EditorPlayer = {
  id: string; // id del MatchPlayer
  name: string;
  number: number | null;
  position: string | null;
  side: "HOME" | "AWAY";
  x: number | null;
  y: number | null;
};

const clamp = (v: number) => Math.min(96, Math.max(4, v));

export default function FormationEditor({ matchId, players, mode, homeName, awayName }: {
  matchId: string; players: EditorPlayer[]; mode: BoardMode; homeName: string; awayName: string;
}) {
  const [state, formAction, pending] = useActionState(saveFormationAction.bind(null, matchId), undefined);
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>(() => {
    const auto = autoLayout(players, mode);
    return Object.fromEntries(players.map((p) => [p.id, p.x != null && p.y != null ? { x: p.x, y: p.y } : auto[p.id]]));
  });
  const [drag, setDrag] = useState<string | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  const move = (id: string, clientX: number, clientY: number) => {
    const r = svg.current?.getBoundingClientRect();
    if (!r) return;
    setPos((s) => ({ ...s, [id]: { x: clamp(((clientX - r.left) / r.width) * 100), y: clamp(((clientY - r.top) / r.height) * 100) } }));
  };
  const nudge = (id: string, dx: number, dy: number) => setPos((s) => ({ ...s, [id]: { x: clamp(s[id].x + dx), y: clamp(s[id].y + dy) } }));
  const reset = () => {
    const auto = autoLayout(players, mode);
    setPos(Object.fromEntries(players.map((p) => [p.id, auto[p.id]])));
  };
  const line = { stroke: "rgba(255,255,255,.45)", strokeWidth: 2, fill: "none" } as const;

  return (
    <form action={formAction}>
      <input type="hidden" name="positions" value={JSON.stringify(players.map((p) => ({ id: p.id, ...pos[p.id] })))} />
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1.5, fontWeight: 700, fontSize: "0.9rem" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: "#fff", border: "2px solid var(--c-sidebar)" }} /> {homeName}</Box>
        {mode === "split" && <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: "var(--c-accent)", border: "2px solid var(--c-sidebar)" }} /> {awayName}</Box>}
      </Box>
      <svg
        ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Cancha: arrastrá a cada jugador a su lugar"
        style={{ display: "block", width: "100%", height: "auto", borderRadius: 14, touchAction: "none", userSelect: "none" }}
        onPointerMove={(e) => drag && move(drag, e.clientX, e.clientY)}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
      >
        <rect width={W} height={H} fill="var(--c-pitch)" />
        {[0, 2, 4, 6, 8].map((i) => <rect key={i} x={i * 60} width="60" height={H} fill="rgba(255,255,255,.04)" />)}
        <rect x="14" y="14" width={W - 28} height={H - 28} rx="8" {...line} />
        <line x1={W / 2} y1="14" x2={W / 2} y2={H - 14} {...line} />
        <circle cx={W / 2} cy={H / 2} r="44" {...line} />
        <rect x="14" y="100" width="76" height="160" {...line} />
        <rect x={W - 90} y="100" width="76" height="160" {...line} />
        {players.map((p) => {
          const c = pos[p.id];
          const gk = p.position === "GK";
          const cx = (c.x / 100) * W;
          const cy = (c.y / 100) * H;
          const home = p.side === "HOME";
          return (
            <g
              key={p.id} tabIndex={0} role="button" aria-label={`${p.name}. Flechas para mover.`}
              style={{ cursor: drag === p.id ? "grabbing" : "grab", touchAction: "none", outline: "none" }}
              onPointerDown={(e) => { (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId); setDrag(p.id); }}
              onKeyDown={(e) => {
                const d = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key];
                if (d) { e.preventDefault(); nudge(p.id, d[0], d[1]); }
              }}
            >
              <circle cx={cx} cy={cy} r="20" fill={gk ? "var(--c-brand)" : home ? "#FFFFFF" : "var(--c-accent)"} stroke={drag === p.id ? "var(--c-brand)" : "var(--c-sidebar)"} strokeWidth="3" />
              <text x={cx} y={cy + 5.5} textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--c-text)" style={{ fontFamily: "var(--font-display)", pointerEvents: "none" }}>{p.number ?? ""}</text>
              <text x={cx} y={cy + 38} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#fff" style={{ pointerEvents: "none" }}>{p.name}</text>
            </g>
          );
        })}
      </svg>
      {state?.error && <Alert severity="error" sx={{ mt: 2 }}>{state.error}</Alert>}
      {state?.ok && <Alert severity="success" sx={{ mt: 2 }}>Formación guardada.</Alert>}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2.5 }}>
        <Button type="submit" variant="contained" size="large" disabled={pending}>{pending ? "Guardando..." : "Guardar formación"}</Button>
        <Button variant="outlined" color="inherit" size="large" onClick={reset}>Reordenar por posición</Button>
        <Button variant="outlined" color="inherit" size="large" href={`/partidos/${matchId}`}>Volver al partido</Button>
      </Box>
    </form>
  );
}
