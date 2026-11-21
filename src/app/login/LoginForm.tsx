"use client";

import { useActionState } from "react";
import NextLink from "next/link";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PasswordField from "@/components/PasswordField";
import { loginAction } from "@/app/actions/auth";

export default function LoginForm({ next = "" }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction}>
      <Stack spacing={2.25}>
        <input type="hidden" name="next" value={next} />
        {state?.error && <Alert severity="error">{state.error}</Alert>}
        <TextField name="email" type="email" label="Email" required autoComplete="email" />
        <PasswordField autoComplete="current-password" />
        <Button type="submit" variant="contained" size="large" disabled={pending}>
          {pending ? "Ingresando..." : "Ingresar"}
        </Button>
        <Typography variant="body2" color="text.secondary">
          ¿No tenés cuenta?{" "}
          <MuiLink component={NextLink} href={next ? `/registro?next=${encodeURIComponent(next)}` : "/registro"} color="inherit">
            Crear cuenta
          </MuiLink>
        </Typography>
      </Stack>
    </form>
  );
}
