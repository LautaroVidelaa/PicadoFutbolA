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
import { createMatchAction } from "@/app/actions/matches";
import { dayLong, timeOf } from "@/lib/matches";
import { FORMATS, VISIBILITY_OPTIONS, formatLabel } from "@/lib/teams";

export type TeamOption = {
  id: string;
  name: string;
  format: number;
  color: string;
  preset: string | null;
  url: string | null;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box component="fieldset" sx={{ border: 0, p: 0, m: 0, minWidth: 0, display: "grid", gap: 2 }}>
      <Typography component="legend" variant="h4" sx={{ fontSize: "1.6rem", mb: 1 }}>{title}</Typography>
      {children}
    </Box>
  );
}

export default function MatchForm({ teams, initialTeamId, initialKind }: { teams: TeamOption[]; initialTeamId: string; initialKind: "teams" | "pickup" }) {
  const [state, formAction, pending] = useActionState(createMatchAction, undefined);
  const [teamId, setTeamId] = useState(initialTeamId);
  const [kind, setKind] = useState<"teams" | "pickup">(teams.length === 0 ? "pickup" : initialKind);
  const pickup = kind === "pickup";
  const team = teams.find((t) => t.id === teamId) ?? teams[0] ?? null;
  const [awayName, setAwayName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("20:00");
  const [venue, setVenue] = useState("");
  const [format, setFormat] = useState<number>(team?.format ?? 5);
  const [visibility, setVisibility] = useState("LINK");


  const when = date ? new Date(`${date}T${time || "00:00"}:00`) : null;

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // La hora que se elige es la del navegador; se manda su huso horario para guardarla bien
        const f = e.currentTarget.elements.namedItem("tzOffset") as HTMLInputElement;
        f.value = String(new Date().getTimezoneOffset());
      }}
    >
      <input type="hidden" name="tzOffset" defaultValue="180" />
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,1fr) 340px" }, alignItems: "start" }}>
        <Card sx={{ display: "grid", gap: 4 }}>
          {state?.error && <Alert severity="error">{state.error}</Alert>}

          <Section title="¿Qué partido es?">
            <input type="hidden" name="kind" value={kind} />
            <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              {([
                ["pickup", "Picado abierto", "Se anotan jugadores y después se arman los dos equipos.", false],
                ["teams", "Entre equipos", "Tu equipo contra un rival. Se convoca a tu plantel.", teams.length === 0],
              ] as const).map(([k, title, desc, off]) => (
                <Box
                  key={k} component="button" type="button" disabled={off} aria-pressed={kind === k}
                  onClick={() => setKind(k)}
                  sx={{
                    textAlign: "left", font: "inherit", cursor: off ? "not-allowed" : "pointer", p: 2, borderRadius: "14px", opacity: off ? 0.5 : 1,
                    color: "text.primary", bgcolor: kind === k ? "var(--c-tint)" : "var(--c-card)",
                    border: "2px solid", borderColor: kind === k ? "var(--c-text)" : "var(--c-border)",
                  }}
                >
                  <Box sx={{ fontWeight: 800, mb: 0.5 }}>{title}</Box>
                  <Box sx={{ fontSize: "0.88rem", color: "text.secondary" }}>{off ? "Necesitás ser capitán de un equipo." : desc}</Box>
                </Box>
              ))}
            </Box>
            {!pickup && team && (<>
            <TextField
              select name="teamId" label="Tu equipo" value={team.id}
              onChange={(e) => { setTeamId(e.target.value); const t = teams.find((x) => x.id === e.target.value); if (t) setFormat(t.format); }}
            >
              {teams.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </TextField>
            <TextField name="awayName" label="Equipo rival" required={!pickup} value={awayName} onChange={(e) => setAwayName(e.target.value)} slotProps={{ htmlInput: { maxLength: 40 } }} helperText="Escribí cómo se llama el equipo contra el que juegan." />
            </>)}
          </Section>

          <Section title="¿Cuándo y dónde?">
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <TextField name="date" type="date" label="Día" required value={date} onChange={(e) => setDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField name="time" type="time" label="Hora" required value={time} onChange={(e) => setTime(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
            <TextField name="venue" label="Cancha (opcional)" value={venue} onChange={(e) => setVenue(e.target.value)} slotProps={{ htmlInput: { maxLength: 80 } }} helperText="Por ejemplo, Cancha El Potrero, Palermo." />
          </Section>

          <Section title="Detalles">
            <TextField select name="format" label="¿Cuántos juegan por lado?" value={format} onChange={(e) => setFormat(Number(e.target.value))} sx={{ maxWidth: 280 }}>
              {FORMATS.map((f) => (
                <MenuItem key={f} value={f}>{formatLabel(f)}</MenuItem>
              ))}
            </TextField>
            <TextField name="notes" label="Aviso para el grupo (opcional)" multiline minRows={2} slotProps={{ htmlInput: { maxLength: 300 } }} helperText="Por ejemplo, llevar camiseta oscura o pagar la cancha." />
            <TextField select name="visibility" label="¿Quién puede ver el partido?" value={visibility} onChange={(e) => setVisibility(e.target.value)} sx={{ maxWidth: 320 }}>
              {VISIBILITY_OPTIONS.map((v) => (
                <MenuItem key={v.value} value={v.value}>{v.label}</MenuItem>
              ))}
            </TextField>
          </Section>

          <Box>
            <Button type="submit" variant="contained" size="large" disabled={pending}>
              {pending ? "Creando..." : "Crear partido"}
            </Button>
          </Box>
        </Card>

        <Box sx={{ order: { xs: -1, lg: 0 }, position: { lg: "sticky" }, top: { lg: 96 } }}>
          <Box sx={{ borderRadius: "20px", p: 3, color: "#fff", background: "linear-gradient(150deg, var(--c-hero-from) 0%, var(--c-hero-to) 100%)", textAlign: "center", display: "grid", gap: 1.5, justifyItems: "center" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 1.5, alignItems: "center", width: "100%" }}>
              <Box sx={{ display: "grid", justifyItems: "center", gap: 0.75, minWidth: 0 }}>
                <Box sx={{ p: 1, borderRadius: "14px", bgcolor: "var(--c-tint)" }}>
                  <Crest crest={{ preset: pickup || !team ? null : team.preset, url: pickup || !team ? null : team.url }} name={pickup || !team ? "Equipo A" : team.name} color={pickup || !team ? "#0E1A3A" : team.color} size={52} />
                </Box>
                <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.25rem", lineHeight: 1, textTransform: "uppercase", overflowWrap: "anywhere" }}>{pickup || !team ? "Equipo A" : team.name}</Box>
              </Box>
              <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.6rem", color: "var(--c-accent)" }}>VS</Box>
              <Box sx={{ display: "grid", justifyItems: "center", gap: 0.75, minWidth: 0 }}>
                <Box sx={{ p: 1, borderRadius: "14px", bgcolor: "var(--c-tint)" }}>
                  <Crest crest={{}} name={pickup ? "Equipo B" : awayName || "?"} color="#75AADB" size={52} />
                </Box>
                <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.25rem", lineHeight: 1, textTransform: "uppercase", overflowWrap: "anywhere" }}>{pickup ? "Equipo B" : awayName || "Rival"}</Box>
              </Box>
            </Box>
            <Box sx={{ color: "var(--c-sidebar-muted)", fontSize: "0.92rem" }}>
              {when && !Number.isNaN(when.getTime()) ? `${dayLong(when)} · ${timeOf(when)} hs` : "Elegí día y hora"}
              {venue ? ` · ${venue}` : ""}
            </Box>
            <Tag tone="brand">{formatLabel(format)}</Tag>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, textAlign: "center" }}>
            {pickup ? "Quienes se anoten van a poder armar los equipos con vos." : "Se convoca a todo el plantel. Vos quedás confirmado."}
          </Typography>
        </Box>
      </Box>
    </form>
  );
}
