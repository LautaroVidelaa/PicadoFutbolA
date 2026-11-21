import Box from "@mui/material/Box";
import type { CSSProperties } from "react";

type Position = "GK" | "DEF" | "MID" | "FWD";

const POSITION_LABEL: Record<Position, string> = {
  GK: "Arquero",
  DEF: "Defensor",
  MID: "Mediocampista",
  FWD: "Delantero",
};

export type PlayerCardProps = {
  name: string;
  position?: Position | null;
  number?: number | null;
  rating?: number | null;
  marketValue?: number | null;
  stats: { matches: number; goals: number; assists: number };
  /** Inclinación en grados */
  tilt?: number;
  /** Si es true, pasa un brillo una vez al cargar */
  shine?: boolean;
};

// Todas las medidas usan cqw (% del ancho de la carta):
// se ve igual de bien chica que grande.
const cq = (n: number, minPx?: number) =>
  minPx ? `max(${minPx}px, ${n}cqw)` : `${n}cqw`;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

function nameSize(name: string) {
  const n = name.length;
  if (n <= 11) return 13;
  if (n <= 15) return 11;
  if (n <= 19) return 9;
  return 7.5;
}

// Carta de jugador: resume el perfil futbolístico de una persona
export default function PlayerCard({
  name,
  position,
  number,
  rating,
  marketValue,
  stats,
  tilt = 0,
  shine = false,
}: PlayerCardProps) {
  const items = [
    ["Partidos", stats.matches],
    ["Goles", stats.goals],
    ["Asist.", stats.assists],
  ] as const;

  return (
    <Box
      className="player-card"
      style={{ "--tilt": `${tilt}deg` } as CSSProperties}
      sx={{ containerType: "inline-size", width: "100%", height: "100%" }}
    >
      <Box
        sx={{
          position: "relative",
          height: "100%",
          overflow: "hidden",
          borderRadius: cq(7),
          p: cq(6),
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(255,255,255,.22)",
          boxShadow: `0 ${cq(2)} ${cq(7)} -${cq(2)} rgba(8,14,40,.6)`,
          background: [
            `repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 ${cq(8)}, transparent ${cq(8)} ${cq(16)})`,
            "radial-gradient(120% 70% at 85% 0%, #4A86C8 0%, transparent 60%)",
            "linear-gradient(165deg, #1B3A78 0%, #0E1A3A 100%)",
          ].join(", "),
          transform: "rotate(var(--tilt, 0deg))",
          transition: "transform .35s cubic-bezier(.2,.8,.3,1)",
          "&:hover": {
            transform: "rotate(calc(var(--tilt, 0deg) * .25)) translateY(-1.5cqw)",
          },
          // Brillo de foil: una pasada al cargar y otra al pasar el mouse
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            mixBlendMode: "overlay",
            backgroundImage:
              "linear-gradient(105deg, transparent 36%, rgba(255,255,255,.6) 46%, rgba(255,206,31,.4) 50%, rgba(117,170,219,.5) 55%, transparent 65%)",
            backgroundSize: "260% 100%",
            backgroundPosition: "130% 0",
            backgroundRepeat: "no-repeat",
            transition: "background-position .9s ease",
            animation: shine ? "sheen 1.4s ease .5s 1 backwards" : "none",
          },
          "&:hover::after": { backgroundPosition: "-30% 0" },
        }}
      >
        {number != null && (
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              right: cq(3),
              top: cq(12),
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: cq(78),
              lineHeight: 0.8,
              opacity: 0.1,
            }}
          >
            {number}
          </Box>
        )}

        <Box
          sx={{
            position: "relative",
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Box
              sx={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: cq(24),
                lineHeight: 0.85,
                opacity: rating == null ? 0.55 : 1,
              }}
            >
              {rating ?? "?"}
            </Box>
            <Box sx={{ fontSize: cq(5, 11), opacity: 0.75, mt: cq(1) }}>Rating</Box>
          </Box>
          <Box sx={{ fontSize: cq(5.4, 11), fontWeight: 600, textAlign: "right", opacity: 0.9 }}>
            {position ? POSITION_LABEL[position] : "Sin posición"}
          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            width: cq(34),
            aspectRatio: "1",
            borderRadius: "50%",
            my: "auto",
            mx: "auto",
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(255,255,255,.12)",
            border: `${cq(1.1)} solid rgba(255,255,255,.4)`,
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: cq(14),
          }}
        >
          {initials(name)}
        </Box>

        <Box
          sx={{
            position: "relative",
            flexShrink: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: cq(nameSize(name)),
            lineHeight: 1,
            textTransform: "uppercase",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </Box>

        <Box
          sx={{
            position: "relative",
            flexShrink: 0,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            mt: cq(3.5),
            pt: cq(2.5),
            borderTop: "1px solid rgba(255,255,255,.25)",
            textAlign: "center",
          }}
        >
          {items.map(([label, value]) => (
            <Box key={label}>
              <Box
                sx={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: cq(10),
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {value}
              </Box>
              <Box sx={{ fontSize: cq(4.8, 11), opacity: 0.75, mt: cq(0.8) }}>{label}</Box>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            position: "relative",
            flexShrink: 0,
            mt: cq(3.5),
            textAlign: "center",
            borderRadius: 999,
            py: cq(1.8),
            fontSize: cq(6, 12),
            ...(marketValue != null
              ? { bgcolor: "#FFCE1F", color: "#0E1A3A", fontWeight: 800 }
              : { bgcolor: "rgba(255,255,255,.14)", color: "rgba(255,255,255,.85)", fontWeight: 600 }),
          }}
        >
          {marketValue != null
            ? `Vale €${marketValue.toLocaleString("es-AR")}`
            : "Todavía sin valor"}
        </Box>
      </Box>
    </Box>
  );
}
