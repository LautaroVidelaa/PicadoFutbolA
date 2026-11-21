"use client";

import { useActionState, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Crest from "@/lib/crests";
import { Card, Tag } from "@/components/ui";
import { createTeamAction } from "@/app/actions/teams";
import { FORMATS, TEAM_COLORS, VISIBILITY_OPTIONS, defaultShortName, formatLabel } from "@/lib/teams";
import CrestPicker, { type CrestChoice } from "./CrestPicker";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Box component="fieldset" sx={{ border: 0, p: 0, m: 0, minWidth: 0, display: "grid", gap: 2 }}>
      <Box>
        <Typography component="legend" variant="h4" sx={{ fontSize: "1.6rem" }}>{title}</Typography>
        {hint && <Typography variant="body2" color="text.secondary">{hint}</Typography>}
      </Box>
      {children}
    </Box>
  );
}

export default function TeamForm() {
  const [state, formAction, pending] = useActionState(createTeamAction, undefined);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [zone, setZone] = useState("");
  const [format, setFormat] = useState<number>(5);
  const [color, setColor] = useState<string>(TEAM_COLORS[0].hex);
  const [crest, setCrest] = useState<CrestChoice>({ preset: "rayo", upload: "" });
  const [visibility, setVisibility] = useState("LINK");

  const shownShort = shortName || (name ? defaultShortName(name) : "");

  return (
    <form action={formAction}>
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,1fr) 340px" }, alignItems: "start" }}>
        <Card sx={{ display: "grid", gap: 4 }}>
          {state?.error && <Alert severity="error">{state.error}</Alert>}

          <Section title="¿Cómo se llama?">
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "minmax(0,1fr) 150px" } }}>
              <TextField name="name" label="Nombre del equipo" required value={name} onChange={(e) => setName(e.target.value)} slotProps={{ htmlInput: { maxLength: 40 } }} />
              <TextField
                name="shortName"
                label="Sigla"
                value={shortName}
                onChange={(e) => setShortName(e.target.value.toUpperCase().replace(/[^A-Z0-9ÁÉÍÓÚÑ]/g, "").slice(0, 4))}
                placeholder={name ? defaultShortName(name) : "PIB"}
                helperText="2 a 4 letras"
              />
            </Box>
            <TextField name="zone" label="Barrio o ciudad (opcional)" value={zone} onChange={(e) => setZone(e.target.value)} slotProps={{ htmlInput: { maxLength: 60 } }} />
          </Section>

          <Section title="Escudo" hint="Elegí uno de la galería o subí el tuyo.">
            <CrestPicker value={crest} onChange={setCrest} />
          </Section>

          <Section title="Camiseta y formato">
            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Color de la camiseta</Typography>
              <Box role="radiogroup" aria-label="Color de la camiseta" sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
                {TEAM_COLORS.map((c) => {
                  const on = color === c.hex;
                  return (
                    <Box key={c.hex} component="label" title={c.name} sx={{ cursor: "pointer", "&:has(input:focus-visible)": { outline: "3px solid var(--c-accent)", outlineOffset: 3, borderRadius: "50%" } }}>
                      <input type="radio" name="color" value={c.hex} checked={on} onChange={() => setColor(c.hex)} style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} aria-label={c.name} />
                      <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: c.hex, border: "2px solid var(--c-text)", display: "grid", placeItems: "center", boxShadow: on ? "0 0 0 3px var(--c-card), 0 0 0 6px var(--c-text)" : "none", transition: "box-shadow 120ms" }} />
                    </Box>
                  );
                })}
              </Box>
            </Box>
            <TextField select name="format" label="¿Cuántos juegan por lado?" value={format} onChange={(e) => setFormat(Number(e.target.value))} sx={{ maxWidth: 280 }}>
              {FORMATS.map((f) => (
                <MenuItem key={f} value={f}>{formatLabel(f)}</MenuItem>
              ))}
            </TextField>
          </Section>

          <Section title="Sobre el equipo">
            <TextField name="description" label="Descripción (opcional)" multiline minRows={2} slotProps={{ htmlInput: { maxLength: 200 } }} helperText="Hasta 200 caracteres. Por ejemplo, cuándo y dónde juegan." />
            <TextField select name="visibility" label="¿Quién puede ver el equipo?" value={visibility} onChange={(e) => setVisibility(e.target.value)} sx={{ maxWidth: 320 }}>
              {VISIBILITY_OPTIONS.map((v) => (
                <MenuItem key={v.value} value={v.value}>{v.label}</MenuItem>
              ))}
            </TextField>
          </Section>

          <Box>
            <Button type="submit" variant="contained" size="large" disabled={pending}>
              {pending ? "Creando..." : "Crear equipo"}
            </Button>
          </Box>
        </Card>

        {/* Vista previa en vivo */}
        <Box sx={{ order: { xs: -1, lg: 0 }, position: { lg: "sticky" }, top: { lg: 96 } }}>
          <Box sx={{ borderRadius: "20px", overflow: "hidden", border: "1px solid var(--c-border)", bgcolor: "var(--c-card)" }}>
            <Box sx={{ height: 14, bgcolor: color, borderBottom: "1px solid var(--c-border)" }} />
            <Box sx={{ p: 3, display: "grid", justifyItems: "center", gap: 1.5, textAlign: "center" }}>
              <Crest crest={{ preset: crest.preset, url: crest.upload }} name={name} color={color} size={96} />
              <Typography variant="h3" sx={{ fontSize: "2.2rem", overflowWrap: "anywhere" }}>{name || "Tu equipo"}</Typography>
              <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", justifyContent: "center" }}>
                {shownShort && <Tag tone="navy">{shownShort}</Tag>}
                <Tag tone="neutral">{formatLabel(format)}</Tag>
                <Tag tone="brand">Capitán: vos</Tag>
              </Box>
              {zone && <Typography variant="body2" color="text.secondary">{zone}</Typography>}
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, textAlign: "center" }}>Así se va a ver tu equipo.</Typography>
        </Box>
      </Box>
    </form>
  );
}
