"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Icon from "@/components/Icon";

// Copia el link del partido para pasarlo por WhatsApp
export default function CopyButton({
  text,
  label = "Copiar link",
  variant = "contained",
  size = "medium",
}: {
  text: string;
  label?: string;
  variant?: "contained" | "outlined";
  size?: "small" | "medium";
}) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2200);
    } catch {
      // Sin permiso del portapapeles: no hacemos nada
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      color={variant === "outlined" ? "inherit" : "primary"}
      onClick={copy}
      startIcon={<Icon name={done ? "check" : "copy"} size={18} />}
      aria-live="polite"
    >
      {done ? "Link copiado" : label}
    </Button>
  );
}
