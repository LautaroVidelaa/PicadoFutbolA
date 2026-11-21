import Box from "@mui/material/Box";
import Avatar from "@/components/Avatar";
import { Tag } from "@/components/ui";
import { POSITIONS, type Position } from "@/lib/player";

// Encabezado del perfil de jugador: quién sos, cómo jugás y cómo venís.
export default function ProfileHeader({
  name,
  position,
  number,
  since,
  rating,
  ratingDelta,
  value,
  compact = false,
  playerId,
  photoSrc,
}: {
  name: string;
  position: Position | null;
  number: number | null;
  since?: string;
  rating: number | null;
  ratingDelta?: number;
  value: string | null;
  /** Para columnas angostas: todo apilado */
  compact?: boolean;
  playerId?: string | null;
  photoSrc?: string;
}) {
  const pos = POSITIONS.find((p) => p.value === position)?.label;
  return (
    <Box
      component="section"
      aria-label={`Perfil de ${name}`}
      sx={{
        display: "grid",
        gap: { xs: 2.5, md: 4 },
        alignItems: "center",
        gridTemplateColumns: compact ? "minmax(0,1fr)" : { xs: "minmax(0,1fr)", md: "auto minmax(0,1fr) 300px" },
        p: { xs: 2.5, md: 3.5 },
        borderRadius: "20px",
        color: "#fff",
        background: "linear-gradient(150deg, var(--c-hero-from) 0%, var(--c-hero-to) 100%)",
      }}
    >
      <Box sx={{ display: compact ? "none" : { xs: "none", md: "block" } }}>
        <Avatar name={name} size={150} square playerId={playerId} photoSrc={photoSrc} />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
          <Box sx={{ display: compact ? "block" : { md: "none" } }}>
            <Avatar name={name} size={72} square playerId={playerId} photoSrc={photoSrc} />
          </Box>
          {since && (
            <Box sx={{ fontSize: "0.82rem", color: "var(--c-sidebar-muted)" }}>
              Jugador amateur · desde {since}
            </Box>
          )}
        </Box>
        <Box
          component="h2"
          sx={{
            m: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            textTransform: "uppercase",
            lineHeight: 0.95,
            fontSize: "clamp(2.4rem, 6vw, 4rem)",
            overflowWrap: "anywhere",
          }}
        >
          {name}
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mt: 1.75 }}>
          {pos ? <Tag tone="neutral">{pos}</Tag> : <Tag tone="warn">Sin posición todavía</Tag>}
          {number != null && <Tag tone="brand">Camiseta {number}</Tag>}
        </Box>
      </Box>

      <Box
        sx={{
          p: 2.5,
          borderRadius: "16px",
          bgcolor: "rgba(255,255,255,.08)",
          border: "1px solid rgba(255,255,255,.12)",
          display: "grid",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Box sx={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--c-sidebar-muted)" }}>Rating</Box>
            <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: rating == null ? "1rem" : "4rem", lineHeight: 0.9, color: rating == null ? "var(--c-sidebar-muted)" : "var(--c-brand)" }}>
              {rating ?? <Box component="span" sx={{ fontSize: "1.1rem", fontFamily: "var(--font-body)", fontWeight: 600, lineHeight: 1.2, display: "block" }}>Se calcula con tus partidos</Box>}
            </Box>
          </Box>
          {ratingDelta != null && rating != null && (
            <Box sx={{ fontWeight: 700, color: "var(--c-accent)", pb: 0.5 }}>
              ↑ {ratingDelta} puntos
            </Box>
          )}
        </Box>
        <Box sx={{ borderTop: "1px solid rgba(255,255,255,.14)", pt: 1.75 }}>
          <Box sx={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--c-sidebar-muted)" }}>Valor de mercado</Box>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.25, flexWrap: "wrap" }}>
            <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "2.2rem", lineHeight: 1 }}>
              {value ?? <Box component="span" sx={{ fontSize: "1.1rem", fontFamily: "var(--font-body)", fontWeight: 600 }}>Todavía sin valor</Box>}
            </Box>
            <Box sx={{ fontSize: "0.8rem", color: "var(--c-sidebar-muted)" }}>Monedas de juego, sin valor real</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
