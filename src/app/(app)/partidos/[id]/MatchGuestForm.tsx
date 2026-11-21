"use client";

import { useActionState, useEffect, useRef } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { addGuestToMatchAction } from "@/app/actions/matches";
import { POSITIONS } from "@/lib/player";

// Sumar a alguien que no usa la app: alcanza con el nombre
export default function MatchGuestForm({ matchId, pickup, homeName, awayName }: { matchId: string; pickup: boolean; homeName: string; awayName: string }) {
  const [state, formAction, pending] = useActionState(addGuestToMatchAction.bind(null, matchId), undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction}>
      <Box sx={{ display: "grid", gap: 1.5 }}>
        {state?.error && <Alert severity="error">{state.error}</Alert>}
        {state?.ok && <Alert severity="success">{state.ok}</Alert>}
        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <TextField name="firstName" label="Nombre" required size="small" slotProps={{ htmlInput: { maxLength: 60 } }} />
          <TextField name="lastName" label="Apellido (opcional)" size="small" slotProps={{ htmlInput: { maxLength: 60 } }} />
          <TextField select name="position" label="Posición" size="small" defaultValue="">
            <MenuItem value="">Sin definir</MenuItem>
            {POSITIONS.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
          </TextField>
          {pickup && (
            <TextField select name="side" label="Equipo" size="small" defaultValue="">
              <MenuItem value="">Sin equipo todavía</MenuItem>
              <MenuItem value="HOME">{homeName}</MenuItem>
              <MenuItem value="AWAY">{awayName}</MenuItem>
            </TextField>
          )}
        </Box>
        {!pickup && <FormControlLabel control={<Checkbox name="toTeam" size="small" />} label="Sumarlo también al plantel" />}
        <Box>
          <Button type="submit" variant="outlined" color="inherit" disabled={pending}>{pending ? "Sumando..." : "Sumar jugador"}</Button>
        </Box>
      </Box>
    </form>
  );
}
