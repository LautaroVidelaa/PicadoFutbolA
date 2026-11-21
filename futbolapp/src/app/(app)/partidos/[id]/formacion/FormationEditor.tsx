"use client";

import { useActionState, useRef, useState, useSyncExternalStore } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { saveFormationAction } from "@/app/actions/matches";
import { autoLayout, FORMATIONS, layoutFormation, type BoardMode } from "@/lib/formation";


export type EditorPlayer = {
  id: string; // id del MatchPlayer
  name: string;
  number: number | null;
  position: string | null;
  side: "HOME" | "AWAY";
  x: number | null;
  y: number | null;
  playerId: string;
  ver: number;
};

const clamp = (v: number) => Math.min(93, Math.max(7, v));

// En el celular la cancha se ve vertical, así hay lugar para arrastrar con el dedo
const subscribe = (cb: () => void) => {
  const m = window.matchMedia("(max-width: 700px)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const useVertical = () => useSyncExternalStore(subscribe, () => window.matchMedia("(max-width: 700px)").matches, () => false);

export default function FormationEditor({ matchId, players, mode, homeName, awayName, perSide }: {
  matchId: string; players: EditorPlayer[]; mode: BoardMode; homeName: string; awayName: string; perSide: number;
}) {
  const vertical = useVertical();
  const W = vertical ? 360 : 600;
  const H = vertical ? 600 : 360;
  const [chosen, setChosen] = useState<{ HOME?: string; AWAY?: string }>({});
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
    {
      const a = ((clientX - r.left) / r.width) * 100;
      const b = ((clientY - r.top) / r.height) * 100;
      setPos((s) => ({ ...s, [id]: vertical ? { x: clamp(b), y: clamp(a) } : { x: clamp(a), y: clamp(b) } }));
    }
  };
  const nudge = (id: string, dx: number, dy: number) => vertical ? setPos((s) => ({ ...s, [id]: { x: clamp(s[id].x + dy), y: clamp(s[id].y + dx) } })) : setPos((s) => ({ ...s, [id]: { x: clamp(s[id].x + dx), y: clamp(s[id].y + dy) } }));
  const reset = () => {
    const auto = autoLayout(players, mode);
    setPos(Object.fromEntries(players.map((p) => [p.id, auto[p.id]])));
  };
  const presets = FORMATIONS[perSide] ?? [];
  const apply = (side: "HOME" | "AWAY", key: string) => {
    const fm = presets.find((x) => x.key === key);
    if (!fm) return;
    const mine = players.filter((p) => p.side === side);
    setPos((s) => ({ ...s, ...layoutFormation(mine, side, fm.lines, mode) }));
    setChosen((c) => ({ ...c, [side]: key }));
  };
  const sidesToShow = (mode === "split" ? ["HOME", "AWAY"] : ["HOME"]) as ("HOME" | "AWAY")[];
  const line = { stroke: "rgba(255,255,255,.45)", strokeWidth: 2, fill: "none" } as const;

  return (
    <form action={formAction}>
      <input type="hidden" name="positions" value={JSON.stringify(players.map((p) => ({ id: p.id, ...pos[p.id] })))} />
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1.5, fontWeight: 700, fontSize: "0.9rem" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: "#fff", border: "2px solid var(--c-sidebar)" }} /> {homeName}</Box>
        {mode === "split" && <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: "var(--c-accent)", border: "2px solid var(--c-sidebar)" }} /> {awayName}</Box>}
      </Box>
      {presets.length > 0 && (
        <Box sx={{ display: "grid", gap: 1.5, mb: 2 }}>
          {sidesToShow.map((side) => (
            <Box key={side}>
              <Box sx={{ fontWeight: 800, fontSize: "0.85rem", mb: 0.75 }}>Formación de {side === "HOME" ? homeName : awayName}</Box>
              <Box role="group" aria-label={`Formaciones para ${side === "HOME" ? homeName : awayName}`} sx={{ display: "flex", gap: 0.75, overflowX: "auto", pb: 0.5 }}>
                {presets.map((fm) => {
                  const on = chosen[side] === fm.key;
                  return (
                    <Box
                      key={fm.key} component="button" type="button" aria-pressed={on} onClick={() => apply(side, fm.key)}
                      sx={{ font: "inherit", fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.15rem", cursor: "pointer", px: 1.75, py: 0.6, borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0, border: "2px solid var(--c-sidebar)", bgcolor: on ? "var(--c-sidebar)" : "transparent", color: on ? "#fff" : "var(--c-sidebar)", transition: "transform .15s", "&:hover": { transform: "translateY(-2px)" } }}
                    >
                      {fm.label}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      )}
      <svg
        ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Cancha: arrastrá a cada jugador a su lugar"
        style={{ display: "block", width: "100%", height: "auto", borderRadius: 14, touchAction: "none", userSelect: "none" }}
        onPointerMove={(e) => drag && move(drag, e.clientX, e.clientY)}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
      >
        <rect width={W} height={H} fill="var(--c-pitch)" />
        {[0, 2, 4, 6, 8].map((i) => vertical ? <rect key={i} y={i * 60} width={W} height="60" fill="rgba(255,255,255,.04)" /> : <rect key={i} x={i * 60} width="60" height={H} fill="rgba(255,255,255,.04)" />)}
        <rect x="14" y="14" width={W - 28} height={H - 28} rx="8" {...line} />
        {vertical ? (
          <>
            <line x1="14" y1={H / 2} x2={W - 14} y2={H / 2} {...line} />
            <circle cx={W / 2} cy={H / 2} r="44" {...line} />
            <rect x="100" y="14" width="160" height="76" {...line} />
            <rect x="100" y={H - 90} width="160" height="76" {...line} />
          </>
        ) : (
          <>
            <line x1={W / 2} y1="14" x2={W / 2} y2={H - 14} {...line} />
            <circle cx={W / 2} cy={H / 2} r="44" {...line} />
            <rect x="14" y="100" width="76" height="160" {...line} />
            <rect x={W - 90} y="100" width="76" height="160" {...line} />
          </>
        )}
        {players.map((p) => {
          const c = pos[p.id];
          const gk = p.position === "GK";
          const cx = ((vertical ? c.y : c.x) / 100) * W;
          const cy = ((vertical ? c.x : c.y) / 100) * H;
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
              <circle cx={cx} cy={cy} r="25" fill={gk ? "var(--c-brand)" : home ? "#FFFFFF" : "var(--c-accent)"} stroke={drag === p.id ? "var(--c-brand)" : home ? "var(--c-sidebar)" : "#fff"} strokeWidth="4" />
              <text x={cx} y={cy + 7} textAnchor="middle" fontSize="20" fontWeight="900" fill="var(--c-text)" style={{ fontFamily: "var(--font-display)", pointerEvents: "none" }}>{p.name.trim().charAt(0).toUpperCase()}</text>
              <clipPath id={`c-${p.id}`}><circle cx={cx} cy={cy} r="22" /></clipPath>
              <image href={`/foto/${p.playerId}${p.ver ? `?v=${p.ver}` : ""}`} x={cx - 22} y={cy - 22} width="44" height="44" preserveAspectRatio="xMidYMid slice" clipPath={`url(#c-${p.id})`} style={{ pointerEvents: "none" }} />
              {p.number != null && (
                <g style={{ pointerEvents: "none" }}>
                  <circle cx={cx + 19} cy={cy - 19} r="9.5" fill="var(--c-sidebar)" stroke="#fff" strokeWidth="1.5" />
                  <text x={cx + 19} y={cy - 15.5} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#fff">{p.number}</text>
                </g>
              )}
              <rect x={cx - 34} y={cy + 29} width="68" height="17" rx="8.5" fill="rgba(7,16,36,.62)" style={{ pointerEvents: "none" }} />
              <text x={cx} y={cy + 41.5} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff" style={{ pointerEvents: "none" }}>{p.name.length > 9 ? p.name.slice(0, 8) + "…" : p.name}</text>
            </g>
          );
        })}
      </svg>
      {state?.error && <Alert severity="error" sx={{ mt: 2 }}>{state.error}</Alert>}
      {state?.ok && <Alert severity="success" sx={{ mt: 2 }}>Formación guardada.</Alert>}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2.5 }}>
        <Button type="submit" variant="contained" size="large" disabled={pending}>{pending ? "Guardando..." : "Guardar formación"}</Button>
        <Button variant="outlined" color="inherit" size="large" onClick={reset}>Acomodar según puesto</Button>
        <Button variant="outlined" color="inherit" size="large" href={`/partidos/${matchId}`}>Volver al partido</Button>
      </Box>
    </form>
  );
}
