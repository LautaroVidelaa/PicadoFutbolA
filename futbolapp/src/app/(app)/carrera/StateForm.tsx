"use client";

import { useActionState, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { saveStateAction } from "@/app/actions/state";
import RadarChart from "@/components/RadarChart";
import { ATTRS, STATUS_OPTIONS, type AttrId, type StatusValue } from "@/lib/state";

export type StateValues = Record<AttrId, number> & { status: StatusValue; note: string };

export default function StateForm({ initial, previous }: { initial: StateValues; previous?: number[] }) {
  const [state, formAction, pending] = useActionState(saveStateAction, undefined);
  const [vals, setVals] = useState<Record<AttrId, number>>({ speed: initial.speed, stamina: initial.stamina, power: initial.power, technique: initial.technique, defense: initial.defense });
  const [status, setStatus] = useState<StatusValue>(initial.status);

  return (
    <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0,1fr)", md: "minmax(0,1fr) minmax(0,1fr)" }, alignItems: "start" }}>
      <RadarChart labels={ATTRS.map((a) => a.label)} values={ATTRS.map((a) => vals[a.id])} previous={previous} label="Tus atributos, de 1 a 10" />
      <form action={formAction}>
        <Box sx={{ display: "grid", gap: 2.25 }}>
          {ATTRS.map((a) => (
            <Box key={a.id}>
              <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: 700, mb: 0.5 }}>
                <label htmlFor={`attr-${a.id}`}>{a.label}</label>
                <span>{vals[a.id]}</span>
              </Box>
              <Box
                component="input" id={`attr-${a.id}`} name={a.id} type="range" min={1} max={10} step={1} value={vals[a.id]}
                onChange={(e) => setVals((v) => ({ ...v, [a.id]: Number(e.target.value) }))}
                sx={{ width: "100%", accentColor: "var(--c-sidebar)" }}
              />
            </Box>
          ))}
          <TextField select name="status" label="¿Cómo estás?" value={status} onChange={(e) => setStatus(e.target.value as StatusValue)}>
            {STATUS_OPTIONS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
          </TextField>
          <TextField name="note" label="Nota personal (opcional)" defaultValue={initial.note} slotProps={{ htmlInput: { maxLength: 120 } }} helperText="La ves solo vos. Tus compañeros ven únicamente si estás listo, con molestias o descansando." />
          {state?.error && <Alert severity="error">{state.error}</Alert>}
          {state?.ok && <Alert severity="success">{state.ok}</Alert>}
          <Box><Button type="submit" variant="contained" size="large" disabled={pending}>{pending ? "Guardando..." : "Guardar mi estado"}</Button></Box>
        </Box>
      </form>
    </Box>
  );
}
