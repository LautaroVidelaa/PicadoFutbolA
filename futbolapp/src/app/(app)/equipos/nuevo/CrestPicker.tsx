"use client";

import { useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { CREST_PRESETS, CrestSvg } from "@/lib/crests";
import Icon from "@/components/Icon";

export type CrestChoice = { preset: string; upload: string };

const SIZE = 256;

// Achica y recorta la imagen a un cuadrado de 256 px, así pesa poco y entra en la base de datos
async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  const side = Math.min(bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();
  const webp = canvas.toDataURL("image/webp", 0.85);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.85);
}

export default function CrestPicker({
  value,
  onChange,
}: {
  value: CrestChoice;
  onChange: (v: CrestChoice) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setError("Subí una imagen PNG, JPG o WebP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("La imagen pesa demasiado. Probá con una de menos de 8 MB.");
      return;
    }
    try {
      onChange({ preset: "", upload: await shrink(file) });
    } catch {
      setError("No pudimos leer esa imagen. Probá con otra.");
    }
  }

  return (
    <Box>
      <Box
        role="radiogroup"
        aria-label="Escudos de la galería"
        sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "repeat(8, 1fr)" }, gap: 1 }}
      >
        {CREST_PRESETS.map((p) => {
          const on = !value.upload && value.preset === p.id;
          return (
            <Box
              key={p.id}
              component="label"
              title={p.name}
              sx={{
                display: "grid",
                placeItems: "center",
                py: 1,
                borderRadius: "12px",
                cursor: "pointer",
                border: "2px solid",
                borderColor: on ? "var(--c-text)" : "transparent",
                bgcolor: on ? "var(--c-tint)" : "var(--c-neutral-bg)",
                transition: "transform 120ms",
                "&:hover": { transform: "translateY(-2px)" },
                "&:has(input:focus-visible)": { outline: "3px solid var(--c-accent)", outlineOffset: 2 },
              }}
            >
              <input
                type="radio"
                name="crestChoice"
                value={p.id}
                checked={on}
                onChange={() => onChange({ preset: p.id, upload: "" })}
                style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                aria-label={`Escudo ${p.name}`}
              />
              <CrestSvg preset={p} size={46} />
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mt: 2 }}>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} hidden />
        <Button type="button" variant="outlined" color="inherit" startIcon={<Icon name="plus" size={18} />} onClick={() => fileRef.current?.click()}>
          {value.upload ? "Cambiar imagen" : "Subir mi propio escudo"}
        </Button>
        {value.upload && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value.upload} alt="Tu escudo" width={44} height={44} style={{ borderRadius: 10, border: "2px solid var(--c-text)" }} />
            <Button type="button" size="small" color="inherit" sx={{ textDecoration: "underline" }} onClick={() => onChange({ preset: "", upload: "" })}>
              Quitar imagen
            </Button>
          </>
        )}
        {!value.upload && value.preset && (
          <Button type="button" size="small" color="inherit" sx={{ textDecoration: "underline" }} onClick={() => onChange({ preset: "", upload: "" })}>
            Sin escudo
          </Button>
        )}
      </Box>
      <Box sx={{ mt: 1, fontSize: "0.82rem", color: "text.secondary" }}>
        La imagen se recorta en cuadrado y se achica sola. Usá una que sea tuya o de tu equipo.
      </Box>
      {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}

      <input type="hidden" name="crestPreset" value={value.preset} />
      <input type="hidden" name="crestUpload" value={value.upload} />
    </Box>
  );
}
