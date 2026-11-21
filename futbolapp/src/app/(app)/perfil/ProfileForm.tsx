"use client";

import { useActionState, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ProfileHeader from "@/components/ProfileHeader";
import { Card } from "@/components/ui";
import { POSITIONS, type Position } from "@/lib/player";
import { updateProfileAction } from "@/app/actions/profile";

type Initial = {
  since: string;
  firstName: string;
  lastName: string;
  position: Position | null;
  number: number | null;
  discoverable: boolean;
  playerId: string | null;
  hasPhoto: boolean;
};

const PHOTO_SIZE = 320;

// Recorta la foto a un cuadrado y la achica en el navegador, así pesa poco
async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  const side = Math.min(bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

// Formulario con vista previa: el encabezado de tu perfil cambia mientras escribís
export default function ProfileForm({ initial }: { initial: Initial }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, undefined);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [position, setPosition] = useState<Position | "">(initial.position ?? "");
  const [number, setNumber] = useState(initial.number?.toString() ?? "");

  const [photo, setPhoto] = useState("");
  const [removed, setRemoved] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const hasPhoto = !!photo || (initial.hasPhoto && !removed);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError(null);
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return setPhotoError("Elegí una imagen PNG, JPG o WEBP.");
    try {
      setPhoto(await shrink(file));
      setRemoved(false);
    } catch {
      setPhotoError("No pudimos leer esa imagen. Probá con otra.");
    }
  }

  const n = number === "" ? null : Number(number);
  const previewNumber = n !== null && Number.isInteger(n) && n >= 0 && n <= 99 ? n : null;

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <ProfileHeader
        name={[firstName, lastName].filter(Boolean).join(" ") || "Tu nombre"}
        position={position || null}
        number={previewNumber}
        since={initial.since}
        rating={null}
        value={null}
        playerId={hasPhoto && !photo ? initial.playerId : null}
        photoSrc={photo || undefined}
      />
      <Card sx={{ maxWidth: 820 }}>
        <form action={formAction}>
          <Box sx={{ display: "grid", gap: 2.5 }}>
            <input type="hidden" name="photo" value={photo} />
            <input type="hidden" name="removePhoto" value={removed && !photo ? "1" : ""} />
            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Tu foto</Typography>
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} hidden />
                <Button type="button" variant="outlined" color="inherit" onClick={() => fileRef.current?.click()}>
                  {hasPhoto ? "Cambiar foto" : "Subir una foto"}
                </Button>
                {hasPhoto && (
                  <Button type="button" size="small" color="inherit" sx={{ textDecoration: "underline" }} onClick={() => { setPhoto(""); setRemoved(true); }}>
                    Quitar foto
                  </Button>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Se recorta en cuadrado y se achica sola. La ven tus compañeros. Se guarda al tocar «Guardar perfil».
              </Typography>
              {photoError && <Alert severity="error" sx={{ mt: 1.5 }}>{photoError}</Alert>}
            </Box>

            {state?.error && <Alert severity="error">{state.error}</Alert>}
            {state?.ok && <Alert severity="success">Listo, tu perfil quedó guardado.</Alert>}

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <TextField name="firstName" label="Nombre" required value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
              <TextField name="lastName" label="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
            </Box>

            <Box component="fieldset" sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
              <Typography component="legend" sx={{ fontWeight: 700, mb: 1 }}>Posición</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: 1 }}>
                {POSITIONS.map((p) => {
                  const on = position === p.value;
                  return (
                    <Box
                      key={p.value}
                      component="label"
                      sx={{
                        display: "grid",
                        placeItems: "center",
                        py: 1.25,
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontWeight: 700,
                        border: "1.5px solid var(--c-text)",
                        bgcolor: on ? "var(--c-text)" : "var(--c-card)",
                        color: on ? "#fff" : "var(--c-text)",
                        "&:has(input:focus-visible)": { outline: "3px solid var(--c-accent)", outlineOffset: 2 },
                      }}
                    >
                      <input
                        type="radio"
                        name="position"
                        value={p.value}
                        checked={on}
                        onChange={() => setPosition(p.value)}
                        style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                      />
                      {p.label}
                    </Box>
                  );
                })}
              </Box>
              {position && (
                <Button type="button" size="small" color="inherit" onClick={() => setPosition("")} sx={{ mt: 0.5, textDecoration: "underline" }}>
                  Quitar posición
                </Button>
              )}
            </Box>

            <TextField
              name="number"
              label="Número de camiseta"
              value={number}
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 2))}
              slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }}
              helperText="De 0 a 99. Es opcional."
              sx={{ maxWidth: 240 }}
            />

            <FormControlLabel
              control={<Checkbox name="discoverable" defaultChecked={initial.discoverable} />}
              label="Que otros jugadores me puedan encontrar en la búsqueda"
            />

            <Box>
              <Button type="submit" variant="contained" size="large" disabled={pending}>
                {pending ? "Guardando..." : "Guardar perfil"}
              </Button>
            </Box>
          </Box>
        </form>
      </Card>

    </Box>
  );
}
