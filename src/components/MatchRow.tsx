import Box from "@mui/material/Box";
import A from "@/components/A";
import Icon from "@/components/Icon";
import { Tag } from "@/components/ui";
import Crest from "@/lib/crests";
import { dayShort, relativeDay, timeOf, type MatchView } from "@/lib/matches";
import { formatLabel } from "@/lib/teams";

// Fila de un partido de la lista: fecha, quién juega contra quién y cuánta gente falta.
// Columnas fijas para que todo quede alineado sin importar el largo de los nombres.
export default function MatchRow({ m }: { m: MatchView }) {
  const missing = Math.max(0, m.needed - m.confirmed);
  return (
    <A
      href={`/partidos/${m.id}`}
      className="lift"
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "96px minmax(0,1fr) auto" },
        alignItems: "center",
        gap: { xs: 1.5, sm: 2.5 },
        p: 2,
        borderRadius: "14px",
        border: "1px solid var(--c-border)",
        bgcolor: "var(--c-card)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <Box>
        <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.5rem", lineHeight: 1, textTransform: "uppercase" }}>
          {dayShort(m.playedAt)}
        </Box>
        <Box sx={{ color: "text.secondary", fontSize: "0.9rem" }}>{timeOf(m.playedAt)} hs</Box>
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 44px minmax(0,1fr)", alignItems: "center", gap: 1.25, fontWeight: 800 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1, minWidth: 0 }}>
            <Box title={m.home.name} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.home.name}</Box>
            <Crest crest={{ preset: m.home.preset, url: m.home.url }} name={m.home.name} color={m.home.color} size={30} />
          </Box>
          <Box sx={{ textAlign: "center", color: "text.secondary", fontWeight: 700 }}>
            {m.score ? `${m.score[0]}–${m.score[1]}` : "vs"}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            <Crest crest={{ preset: m.away.preset, url: m.away.url }} name={m.away.name} color={m.away.color} size={30} />
            <Box title={m.away.name} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.away.name}</Box>
          </Box>
        </Box>
        <Box sx={{ color: "text.secondary", fontSize: "0.86rem", mt: 0.75, display: "flex", gap: 0.75, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
          {m.venue && (
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
              <Icon name="pin" size={15} /> {m.venue} ·
            </Box>
          )}
          <span>{formatLabel(m.format)}</span>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
        {!m.finished && <Tag tone={m.past ? "warn" : "neutral"}>{relativeDay(m.playedAt)}</Tag>}
        {!m.finished && (
          <Tag tone={missing === 0 ? "ok" : "warn"}>
            {m.confirmed}/{m.needed} confirmados
          </Tag>
        )}
      </Box>
    </A>
  );
}
