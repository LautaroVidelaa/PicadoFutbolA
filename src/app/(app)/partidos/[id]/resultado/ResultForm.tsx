"use client";

import { useActionState, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { saveResultAction } from "@/app/actions/matches";
import { Card, SectionTitle } from "@/components/ui";

type P = { id: string; name: string };
type Row = { key: number; scorer: string; assister: string };

export default function ResultForm({
  matchId, homeName, awayName, pickup, players, initial,
}: {
  matchId: string;
  homeName: string;
  awayName: string;
  pickup: boolean;
  players: P[];
  initial: { home: number; away: number; mvp: string; goals: { scorer: string; assister: string }[] };
}) {
  const [state, formAction, pending] = useActionState(saveResultAction.bind(null, matchId), undefined);
  const [home, setHome] = useState(String(initial.home));
  const [away, setAway] = useState(String(initial.away));
  const [rows, setRows] = useState<Row[]>(initial.goals.map((g, i) => ({ key: i, ...g })));
  const [next, setNext] = useState(initial.goals.length);
  const [mvp, setMvp] = useState(initial.mvp);

  const homeN = Number(home) || 0;
  const options = (empty: string) => [
    <option key="" value="">{empty}</option>,
    ...players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>),
  ];
  const update = (key: number, patch: Partial<Row>) => setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const big = { "& input": { textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "3rem", p: 1 } };

  return (
    <form action={formAction}>
      <Box sx={{ display: "grid", gap: 3, maxWidth: 760 }}>
        <Card>
          <SectionTitle>Marcador</SectionTitle>
          <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)", gap: 2, alignItems: "end" }}>
            <Box sx={{ textAlign: "center", minWidth: 0 }}>
              <Box sx={{ fontWeight: 800, mb: 1, overflowWrap: "anywhere" }}>{homeName}</Box>
              <TextField name="homeScore" type="number" value={home} onChange={(e) => setHome(e.target.value)} slotProps={{ htmlInput: { min: 0, max: 99, "aria-label": `Goles de ${homeName}` } }} sx={big} fullWidth />
            </Box>
            <Box sx={{ pb: 2, fontWeight: 900, fontSize: "1.6rem" }}>-</Box>
            <Box sx={{ textAlign: "center", minWidth: 0 }}>
              <Box sx={{ fontWeight: 800, mb: 1, overflowWrap: "anywhere" }}>{awayName}</Box>
              <TextField name="awayScore" type="number" value={away} onChange={(e) => setAway(e.target.value)} slotProps={{ htmlInput: { min: 0, max: 99, "aria-label": `Goles de ${awayName}` } }} sx={big} fullWidth />
            </Box>
          </Box>
        </Card>

        <Card>
          <SectionTitle>{pickup ? "Goles" : `Goles de ${homeName}`}</SectionTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Anotá quién hizo cada gol y quién dio el pase. Es lo que suma a la carrera de cada jugador. Si un gol no lo cargás, igual queda en el marcador.
          </Typography>
          <Box sx={{ display: "grid", gap: 1.5 }}>
            {rows.map((r, i) => (
              <Box key={r.key} sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "minmax(0,1fr) minmax(0,1fr) auto" }, alignItems: "center", p: 1.5, borderRadius: "12px", bgcolor: "var(--c-neutral-bg)" }}>
                <TextField select name="scorer" label={`Gol ${i + 1}: goleador`} value={r.scorer} onChange={(e) => update(r.key, { scorer: e.target.value })} slotProps={{ select: { native: true }, inputLabel: { shrink: true } }} size="small">{options("Elegí")}</TextField>
                <TextField select name="assister" label="Asistencia" value={r.assister} onChange={(e) => update(r.key, { assister: e.target.value })} slotProps={{ select: { native: true }, inputLabel: { shrink: true } }} size="small">{options("Sin asistencia")}</TextField>
                <Button color="inherit" size="small" onClick={() => setRows((x) => x.filter((y) => y.key !== r.key))} aria-label={`Quitar gol ${i + 1}`}>Quitar</Button>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Button variant="outlined" color="inherit" disabled={rows.length >= homeN + (Number(away) || 0)} onClick={() => { setRows((x) => [...x, { key: next, scorer: "", assister: "" }]); setNext(next + 1); }}>
              Agregar gol
            </Button>
            <Box sx={{ fontSize: "0.85rem", color: "text.secondary" }}>{rows.length} de {pickup ? homeN + (Number(away) || 0) : homeN} cargados</Box>
          </Box>
        </Card>

        <Card>
          <SectionTitle>Figura del partido</SectionTitle>
          <TextField select name="mvp" value={mvp} onChange={(e) => setMvp(e.target.value)} slotProps={{ select: { native: true }, htmlInput: { "aria-label": "Figura del partido" } }} fullWidth>
            {options("Sin figura")}
          </TextField>
        </Card>

        {state?.error && <Alert severity="error">{state.error}</Alert>}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button type="submit" variant="contained" size="large" disabled={pending}>{pending ? "Guardando..." : "Guardar resultado"}</Button>
          <Button variant="outlined" color="inherit" size="large" href={`/partidos/${matchId}`}>Cancelar</Button>
        </Box>
      </Box>
    </form>
  );
}
