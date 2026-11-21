import Box from "@mui/material/Box";
import A from "@/components/A";
import Icon from "@/components/Icon";
import { MY_TEAM, myOutcome, type DemoMatch } from "@/lib/demo";

const OUTCOME = {
  G: { letter: "V", label: "Victoria", bg: "var(--c-text)", fg: "#fff", edge: "var(--c-text)" },
  E: { letter: "E", label: "Empate", bg: "var(--c-neutral-bg)", fg: "var(--c-text)", edge: "var(--c-accent)" },
  P: { letter: "D", label: "Derrota", bg: "var(--c-bad-bg)", fg: "var(--c-bad-text)", edge: "var(--c-bad-text)" },
} as const;

function Num({ value, label }: { value: number; label: string }) {
  return (
    <Box sx={{ textAlign: "center", width: 58, opacity: value === 0 ? 0.45 : 1 }}>
      <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.6rem", lineHeight: 1 }}>{value}</Box>
      <Box sx={{ fontSize: "0.7rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</Box>
    </Box>
  );
}

// Fila de un partido jugado. Las columnas tienen ancho fijo para que todo quede alineado
// sin importar el largo del nombre del rival (el nombre se corta con "…").
export default function ResultRow({ m }: { m: DemoMatch }) {
  const o = OUTCOME[myOutcome(m)];
  const rival = m.home.name === MY_TEAM ? m.away.name : m.home.name;
  const [h, a] = m.score!;
  const mine = m.home.name === MY_TEAM ? [h, a] : [a, h];
  const mi = m.mine!;

  return (
    <A
      href={`/partidos/${m.id}`}
      sx={{
        display: "grid",
        alignItems: "center",
        columnGap: { xs: 1.5, sm: 2.5 },
        rowGap: 1,
        gridTemplateColumns: { xs: "44px minmax(0,1fr) 92px", sm: "44px 74px minmax(0,1fr) 104px 176px" },
        gridTemplateAreas: {
          xs: '"badge rival score" "badge meta meta"',
          sm: '"badge date rival score stats"',
        },
        position: "relative",
        p: 1.5,
        pl: 2,
        borderRadius: "14px",
        bgcolor: "var(--c-card)",
        border: "1px solid var(--c-border)",
        textDecoration: "none",
        color: "inherit",
        overflow: "hidden",
        transition: "transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease",
        "&::before": { content: '""', position: "absolute", left: 0, top: 0, bottom: 0, width: 5, bgcolor: o.edge },
        "&:hover": { transform: "translateY(-2px)", borderColor: "var(--c-text)", boxShadow: "0 6px 0 -2px color-mix(in srgb, var(--c-text) 14%, transparent)" },
      }}
    >
      <Box aria-label={o.label} sx={{ gridArea: "badge", width: 44, height: 44, borderRadius: "12px", display: "grid", placeItems: "center", bgcolor: o.bg, color: o.fg, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.6rem" }}>
        {o.letter}
      </Box>

      <Box sx={{ gridArea: "date", display: { xs: "none", sm: "block" }, lineHeight: 1.15 }}>
        <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.3rem", textTransform: "uppercase" }}>{m.date.replace(/^\S+ /, "")}</Box>
        <Box sx={{ fontSize: "0.78rem", color: "text.secondary" }}>{m.format}</Box>
      </Box>

      <Box sx={{ gridArea: "rival", minWidth: 0 }}>
        <Box sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.04em" }}>vs.</Box>
        <Box title={rival} sx={{ fontWeight: 800, fontSize: "1.1rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rival}</Box>
      </Box>

      <Box
        aria-label={`Resultado ${mine[0]} a ${mine[1]}`}
        sx={{ gridArea: "score", justifySelf: { xs: "end", sm: "stretch" }, width: { xs: 92, sm: "auto" }, textAlign: "center", py: 0.75, borderRadius: "12px", bgcolor: "var(--c-text)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.9rem", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
      >
        {mine[0]}<Box component="span" sx={{ color: "var(--c-accent)", mx: 0.75 }}>–</Box>{mine[1]}
      </Box>

      {/* Escritorio: goles, asistencias y MVP en columnas fijas */}
      <Box sx={{ gridArea: "stats", display: { xs: "none", sm: "flex" }, alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
        <Num value={mi.goals} label="Goles" />
        <Num value={mi.assists} label="Asist." />
        <Box sx={{ width: 36, display: "grid", placeItems: "center", color: "var(--c-brand-text)" }} title={mi.mvp ? "Fuiste el MVP" : undefined}>
          {mi.mvp && (
            <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "var(--c-brand)", display: "grid", placeItems: "center" }}>
              <Icon name="star" size={18} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Celular: una sola línea con fecha y números */}
      <Box sx={{ gridArea: "meta", display: { xs: "flex", sm: "none" }, alignItems: "center", gap: 1.25, color: "text.secondary", fontSize: "0.82rem", minWidth: 0 }}>
        <span>{m.date}</span>
        <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>{mi.goals} G · {mi.assists} A</Box>
        {mi.mvp && <Box component="span" sx={{ px: 1, py: 0.2, borderRadius: 999, bgcolor: "var(--c-brand)", color: "var(--c-brand-text)", fontWeight: 800 }}>MVP</Box>}
      </Box>
    </A>
  );
}
