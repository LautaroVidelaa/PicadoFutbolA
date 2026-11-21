"use client";

import { useActionState, useRef, useEffect } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { addGuestPlayerAction } from "@/app/actions/invites";
import { POSITIONS } from "@/lib/player";

// Suma al plantel a alguien que todavía no tiene cuenta
export default function GuestForm({ teamId }: { teamId: string }) {
  const [state, formAction, pending] = useActionState(addGuestPlayerAction.bind(null, teamId), undefined);
  const ref = useRef<HTMLFormElement>(null);

  // Al sumar bien, se limpia el formulario para cargar al siguiente
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction}>
      <Box sx={{ display: "grid", gap: 1.5 }}>
        {state?.error && <Alert severity="error">{state.error}</Alert>}
        {state?.ok && <Alert severity="success">{state.ok}</Alert>}
        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" } }}>
          <TextField name="firstName" label="Nombre" required size="small" slotProps={{ htmlInput: { maxLength: 60 } }} />
          <TextField name="lastName" label="Apellido" size="small" slotProps={{ htmlInput: { maxLength: 60 } }} />
          <TextField select name="position" label="Posición" size="small" defaultValue="">
            <MenuItem value="">Sin definir</MenuItem>
            {POSITIONS.map((p) => (
              <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
            ))}
          </TextField>
        </Box>
        <Box>
          <Button type="submit" variant="outlined" color="inherit" disabled={pending}>
            {pending ? "Sumando..." : "Sumar al plantel"}
          </Button>
        </Box>
      </Box>
    </form>
  );
}
