"use client";

import { useActionState } from "react";
import NextLink from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PasswordField from "@/components/PasswordField";
import { registerAction } from "@/app/actions/auth";

export default function RegisterForm({ next = "" }: { next?: string }) {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <form action={formAction}>
      <Stack spacing={2.25}>
        <input type="hidden" name="next" value={next} />
        {state?.error && <Alert severity="error">{state.error}</Alert>}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.25 }}>
          <TextField name="firstName" label="Nombre" required autoComplete="given-name" />
          <TextField name="lastName" label="Apellido" autoComplete="family-name" />
        </Box>
        <TextField name="email" type="email" label="Email" required autoComplete="email" />
        <PasswordField
          autoComplete="new-password"
          helperText="Mínimo 8 caracteres."
        />
        <Button type="submit" variant="contained" size="large" disabled={pending}>
          {pending ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
        <Typography variant="body2" color="text.secondary">
          ¿Ya tenés cuenta?{" "}
          <MuiLink component={NextLink} href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} color="inherit">
            Ingresar
          </MuiLink>
        </Typography>
      </Stack>
    </form>
  );
}
