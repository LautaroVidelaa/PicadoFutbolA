"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

type Props = {
  name?: string;
  label?: string;
  autoComplete: "new-password" | "current-password";
  helperText?: string;
};

export default function PasswordField({
  name = "password",
  label = "Contraseña",
  autoComplete,
  helperText,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      name={name}
      label={label}
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      helperText={helperText}
      required
      fullWidth
      slotProps={{
        input: {
          endAdornment: (
            <Button
              type="button"
              size="small"
              color="inherit"
              onClick={() => setVisible((v) => !v)}
              aria-pressed={visible}
              sx={{ minWidth: 0, px: 1.5, fontWeight: 700 }}
            >
              {visible ? "Ocultar" : "Mostrar"}
            </Button>
          ),
        },
      }}
    />
  );
}
