"use client";

import { useActionState, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { updateSidesAction } from "@/app/actions/matches";
import CrestPicker, { type CrestChoice } from "@/app/(app)/equipos/nuevo/CrestPicker";

type Side = { name: string; preset: string | null; url: string | null };

// Nombre y escudo de cada lado; solo se muestran los lados que se pueden editar
export default function SidesForm({ matchId, home, away }: { matchId: string; home: Side | null; away: Side | null }) {
  const [state, formAction, pending] = useActionState(updateSidesAction.bind(null, matchId), undefined);
  const [h, setH] = useState<CrestChoice>({ preset: home?.preset ?? "", upload: home?.url ?? "" });
  const [a, setA] = useState<CrestChoice>({ preset: away?.preset ?? "", upload: away?.url ?? "" });

  const block = (key: "home" | "away", side: Side, label: string, crest: CrestChoice, set: (c: CrestChoice) => void) => (
    <Box sx={{ display: "grid", gap: 1.5 }}>
      <TextField name={`${key}Name`} label={label} defaultValue={side.name} required size="small" slotProps={{ htmlInput: { maxLength: 30 } }} />
      <input type="hidden" name={`${key}Preset`} value={crest.upload ? "" : crest.preset} />
      <input type="hidden" name={`${key}Url`} value={crest.upload} />
      <CrestPicker value={crest} onChange={set} />
    </Box>
  );

  return (
    <form action={formAction}>
      <Box sx={{ display: "grid", gap: 3 }}>
        {home && block("home", home, "Nombre del primer equipo", h, setH)}
        {away && block("away", away, home ? "Nombre del segundo equipo" : "Nombre del rival", a, setA)}
        {state?.error && <Alert severity="error">{state.error}</Alert>}
        {state?.ok && <Alert severity="success">{state.ok}</Alert>}
        <Box><Button type="submit" variant="contained" disabled={pending}>{pending ? "Guardando..." : "Guardar equipos"}</Button></Box>
      </Box>
    </form>
  );
}
