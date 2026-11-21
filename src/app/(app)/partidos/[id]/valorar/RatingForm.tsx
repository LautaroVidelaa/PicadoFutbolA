"use client";

import { useActionState, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { saveRatingsAction } from "@/app/actions/matches";
import Avatar from "@/components/Avatar";
import { Card } from "@/components/ui";
import { MAX_TRAITS, TRAITS } from "@/lib/ratings";

export type Mate = { id: string; name: string; score: number | null; traits: string[] };

export default function RatingForm({ matchId, mates }: { matchId: string; mates: Mate[] }) {
  const [state, formAction, pending] = useActionState(saveRatingsAction.bind(null, matchId), undefined);
  const [scores, setScores] = useState<Record<string, number | null>>(Object.fromEntries(mates.map((m) => [m.id, m.score])));
  const [traits, setTraits] = useState<Record<string, string[]>>(Object.fromEntries(mates.map((m) => [m.id, m.traits])));

  const toggle = (id: string, t: string) =>
    setTraits((s) => {
      const cur = s[id] ?? [];
      if (cur.includes(t)) return { ...s, [id]: cur.filter((x) => x !== t) };
      return cur.length >= MAX_TRAITS ? s : { ...s, [id]: [...cur, t] };
    });

  return (
    <form action={formAction}>
      <Box sx={{ display: "grid", gap: 2, maxWidth: 760 }}>
        {mates.map((m) => (
          <Card key={m.id}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Avatar name={m.name} size={42} playerId={m.id} />
              <Box sx={{ fontWeight: 800, fontSize: "1.1rem", overflowWrap: "anywhere" }}>{m.name}</Box>
            </Box>
            <input type="hidden" name={`score:${m.id}`} value={scores[m.id] ?? ""} />
            <Box role="radiogroup" aria-label={`Nota para ${m.name}`} sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 0.75, mb: 2, "@media (min-width:600px)": { gridTemplateColumns: "repeat(10, minmax(0,1fr))" } }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                const on = scores[m.id] === n;
                return (
                  <Box
                    key={n} component="button" type="button" role="radio" aria-checked={on}
                    onClick={() => setScores((s) => ({ ...s, [m.id]: on ? null : n }))}
                    sx={{ font: "inherit", fontWeight: 800, cursor: "pointer", py: 1, borderRadius: "10px", border: "2px solid", borderColor: on ? "var(--c-text)" : "var(--c-border)", bgcolor: on ? "var(--c-brand)" : "var(--c-card)", color: "var(--c-text)" }}
                  >
                    {n}
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 1 }}>Se destacó en (hasta {MAX_TRAITS}, opcional)</Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {TRAITS.map((t) => {
                const on = (traits[m.id] ?? []).includes(t.id);
                return (
                  <Box key={t.id} component="label" sx={{ cursor: "pointer", px: 1.5, py: 0.6, borderRadius: 999, fontWeight: 700, fontSize: "0.88rem", border: "1.5px solid", borderColor: on ? "var(--c-text)" : "var(--c-border)", bgcolor: on ? "var(--c-tint)" : "transparent", "&:has(input:focus-visible)": { outline: "3px solid var(--c-accent)" } }}>
                    <input
                      type="checkbox" name={`traits:${m.id}`} value={t.id} checked={on} onChange={() => toggle(m.id, t.id)}
                      style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                    />
                    {t.label}
                  </Box>
                );
              })}
            </Box>
          </Card>
        ))}
        {state?.error && <Alert severity="error">{state.error}</Alert>}
        {state?.ok && <Alert severity="success">{state.ok}</Alert>}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button type="submit" variant="contained" size="large" disabled={pending}>{pending ? "Guardando..." : "Guardar valoraciones"}</Button>
          <Button variant="outlined" color="inherit" size="large" href={`/partidos/${matchId}`}>Volver al partido</Button>
        </Box>
      </Box>
    </form>
  );
}
