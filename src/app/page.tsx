import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { auth } from "@/auth";
import Logo from "@/components/Logo";
import Pitch from "@/components/Pitch";
import ProfileHeader from "@/components/ProfileHeader";
import { BRAND } from "@/lib/brand";
import { wrap } from "@/lib/ui";

const ORGANIZE = [
  ["Partidos", "Fútbol 5, 6, 7, 8, 9, 11 o la cantidad que juegues."],
  ["Equipos y jugadores", "Armá tu equipo y sumá a los que vienen, incluso si todavía no tienen cuenta."],
  ["Formaciones", "Ubicá a cada uno en la cancha antes de jugar."],
  ["Link para compartir", "Mandalo por WhatsApp. Se abre sin crear cuenta."],
  ["Resultado", "Cargá el marcador, los goles y las asistencias."],
] as const;

const REMEMBER = [
  ["Historial", "Todos tus partidos, filtrados por año, equipo o resultado."],
  ["Perfil de jugador", "Posición, equipos y estadísticas en un solo perfil."],
  ["Estadísticas", "Goles, asistencias, MVP, victorias, empates y derrotas, siempre al día."],
  ["Valoraciones y MVP", "Tus compañeros te califican después del partido. Llega pronto."],
  ["Evolución y valor de mercado", "Mirá cómo mejorás con el tiempo. Es un juego, no plata de verdad. Llega pronto."],
] as const;

const CAREER = [
  { year: "2024", team: "Los Pibes FC" },
  { year: "2025", team: "Deportivo La 12" },
  { year: "2026", team: "Los Borrachos" },
  { year: "2026", team: "Los Pibes FC" },
];

const SCORERS = [
  ["Lautaro", 2],
  ["Nico", 1],
  ["Mati", 1],
  ["Fede", 1],
] as const;

const PROFILE_DELTAS = [
  ["Partidos", 43, "+1"],
  ["Goles", 89, "+2"],
  ["MVP", 9, "+1"],
] as const;

const smallLabel = { fontSize: "0.85rem", fontWeight: 700, color: "text.secondary", mb: 0.75 } as const;

function Feature({ title, items }: { title: string; items: readonly (readonly [string, string])[] }) {
  return (
    <Box>
      <Typography variant="h3" sx={{ fontSize: { xs: "2.4rem", md: "3rem" }, mb: 3 }}>
        {title}
      </Typography>
      <Box component="dl" sx={{ m: 0 }}>
        {items.map(([term, text]) => (
          <Box
            key={term}
            sx={{
              py: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              "&:last-of-type": { borderBottom: "1px solid", borderBottomColor: "divider" },
            }}
          >
            <Box component="dt" sx={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem", lineHeight: 1.1 }}>
              {term}
            </Box>
            <Box component="dd" sx={{ m: 0, mt: 0.5, color: "text.secondary", maxWidth: "46ch" }}>
              {text}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/inicio");

  return (
    <Box>
      <Box component="header" sx={{ ...wrap, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo />
        <Button href="/login" color="inherit" sx={{ fontWeight: 700 }}>
          Ingresar
        </Button>
      </Box>

      {/* Hero: la idea completa en una sola vista */}
      <Box
        component="section"
        sx={{
          ...wrap,
          display: "grid",
          gap: { xs: 6, md: 7 },
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" },
          alignItems: "center",
          pt: { xs: 3, md: 7 },
          pb: { xs: 9, md: 13 },
        }}
      >
        <Box>
          <Typography variant="h1" sx={{ fontSize: "clamp(3.6rem, 9.6vw, 6.4rem)", lineHeight: 1, mb: 3 }}>
            <Box component="span" sx={{ display: "block" }}>Tus partidos.</Box>
            <Box component="span" sx={{ display: "block" }}>Tu carrera.</Box>
          </Typography>
          <Typography sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" }, lineHeight: 1.5, maxWidth: "42ch", mb: 4 }}>
            Organizá partidos, equipos y formaciones, compartí el link por WhatsApp y cargá el
            resultado. Todo queda en tu perfil, juegues con el equipo que juegues.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
            <Button href="/registro" variant="contained" size="large">
              Crear mi cuenta
            </Button>
            <Button
              href="/login"
              color="inherit"
              size="large"
              sx={{ fontWeight: 700, px: 0, minWidth: 0, textDecoration: "underline", textUnderlineOffset: "4px", "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
            >
              Ya tengo cuenta
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5 }}>
            Es gratis y no hace falta descargar nada.
          </Typography>
        </Box>

        {/* Un partido ya jugado: resultado, formación, goles, link y el efecto en el perfil */}
        <Box
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow:
              "0 1px 0 color-mix(in srgb, var(--mui-palette-text-primary) 10%, transparent), 0 24px 48px -24px color-mix(in srgb, var(--mui-palette-text-primary) 45%, transparent)",
          }}
        >
          <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, color: "text.secondary", fontSize: "0.9rem", mb: 1 }}>
              <span>Fútbol 5</span>
              <span>Domingo 8 de noviembre, 18:00</span>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: { xs: 1, sm: 2 },
                fontFamily: "var(--font-display)",
              }}
            >
              <Box sx={{ fontWeight: 800, fontSize: { xs: "1.15rem", sm: "1.7rem" }, lineHeight: 1.05 }}>
                Los Pibes FC
              </Box>
              <Box sx={{ fontWeight: 900, fontSize: { xs: "2.6rem", sm: "3.8rem" }, lineHeight: 0.9, fontVariantNumeric: "tabular-nums" }}>
                5 – 3
              </Box>
              <Box sx={{ fontWeight: 800, fontSize: { xs: "1.15rem", sm: "1.7rem" }, lineHeight: 1.05, textAlign: "right" }}>
                Las Maracas
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1.1fr) minmax(0, 1fr)" },
              gap: 2.5,
              px: { xs: 2, sm: 3 },
              pb: 2.5,
            }}
          >
            <Box sx={{ width: "100%", maxWidth: { xs: 280, sm: "none" }, mx: { xs: "auto", sm: 0 } }}>
              <Pitch />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box>
                <Box sx={smallLabel}>Goles</Box>
                {SCORERS.map(([name, goals]) => (
                  <Box key={name} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
                    <span>{name}</span>
                    <Box component="span" sx={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", lineHeight: 1.2, fontVariantNumeric: "tabular-nums" }}>
                      {goals}
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box>
                <Box sx={smallLabel}>MVP</Box>
                <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem", lineHeight: 1 }}>Lautaro</Box>
              </Box>
              <Box sx={{ mt: "auto" }}>
                <Box sx={smallLabel}>Link del partido</Box>
                <Box
                  sx={{
                    display: "inline-block",
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 999,
                    border: "1.5px dashed",
                    borderColor: "color-mix(in srgb, var(--mui-palette-text-primary) 35%, transparent)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    overflowWrap: "anywhere",
                  }}
                >
                  {BRAND.domain}/p/8FJ29K
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "color-mix(in srgb, var(--mui-palette-secondary-main) 16%, transparent)",
            }}
          >
            <Box sx={{ ...smallLabel, color: "text.primary" }}>Se suma al perfil de Lautaro</Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 2.5, sm: 4 } }}>
              {PROFILE_DELTAS.map(([label, total, delta]) => (
                <Box key={label}>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
                    <Box component="span" sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "2.2rem", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                      {total}
                    </Box>
                    <Box component="span" sx={{ bgcolor: "#FFCE1F", color: "#0E1A3A", fontWeight: 800, fontSize: "0.8rem", px: 0.75, py: 0.125, borderRadius: 999 }}>
                      {delta}
                    </Box>
                  </Box>
                  <Box sx={{ color: "text.secondary", fontSize: "0.9rem" }}>{label}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Las dos mitades de la plataforma */}
      <Box component="section" sx={{ borderTop: "2px solid", borderColor: "text.primary" }}>
        <Box
          sx={{
            ...wrap,
            py: { xs: 8, md: 12 },
            display: "grid",
            gap: { xs: 8, md: 8 },
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          }}
        >
          <Feature title="Organizás el partido" items={ORGANIZE} />
          <Feature title="Recordás lo que jugaste" items={REMEMBER} />
        </Box>
      </Box>

      {/* El jugador no pertenece a un equipo */}
      <Box component="section" sx={{ borderTop: "1px solid", borderColor: "divider" }}>
        <Box
          sx={{
            ...wrap,
            py: { xs: 8, md: 12 },
            display: "grid",
            gap: { xs: 7, md: 10 },
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 5fr) minmax(0, 6fr)" },
            alignItems: "center",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 560, mx: { xs: "auto", md: 0 } }}>
            <ProfileHeader
              name="Lautaro Videla"
              position="FWD"
              number={9}
              since="marzo de 2026"
              rating={84}
              ratingDelta={3}
              value="12,5 M"
              compact
            />
          </Box>
          <Box>
            <Typography variant="h2" sx={{ fontSize: { xs: "3rem", md: "4.5rem" }, mb: 2, textWrap: "balance" }}>
              Cambiás de equipo. Tu historia sigue.
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: "46ch" }}>
              Tu perfil es tuyo, no del equipo. Todos los partidos que jugues, con quien sea, suman a una sola carrera.
            </Typography>
            <Box
              component="ol"
              sx={{
                listStyle: "none",
                m: 0,
                mt: 4,
                p: 0,
                pl: "36px",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: "8px",
                  top: "10px",
                  bottom: "10px",
                  width: "2px",
                  bgcolor: "text.primary",
                },
              }}
            >
              {CAREER.map((c, i) => (
                <Box
                  component="li"
                  key={`${c.year}-${c.team}-${i}`}
                  sx={{
                    position: "relative",
                    pb: i === CAREER.length - 1 ? 0 : 2.5,
                    display: "flex",
                    alignItems: "baseline",
                    gap: 2,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: "-36px",
                      top: "8px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      boxSizing: "border-box",
                      border: "2px solid",
                      borderColor: "text.primary",
                      bgcolor: i === CAREER.length - 1 ? "primary.main" : "background.default",
                    },
                  }}
                >
                  <Box component="span" sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.8rem", lineHeight: 1, minWidth: "3.2rem", fontVariantNumeric: "tabular-nums" }}>
                    {c.year}
                  </Box>
                  <Box component="span" sx={{ fontWeight: 700, fontSize: "1.2rem" }}>{c.team}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box component="section" sx={{ bgcolor: "primary.main", color: "#0E1A3A" }}>
        <Box
          sx={{
            ...wrap,
            py: { xs: 8, md: 11 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          <Typography variant="h2" sx={{ fontSize: { xs: "3.4rem", md: "5.5rem" }, textWrap: "balance" }}>
            Registrá tu próximo partido.
          </Typography>
          <Button
            href="/registro"
            variant="contained"
            color="inherit"
            size="large"
            sx={{
              bgcolor: "#0E1A3A",
              color: "#fff",
              boxShadow: "0 3px 0 0 rgba(0,0,0,.35)",
              "&:hover": { bgcolor: "#18295C", boxShadow: "0 4px 0 0 rgba(0,0,0,.35)" },
            }}
          >
            Crear mi cuenta
          </Button>
        </Box>
      </Box>

      <Box component="footer" sx={{ ...wrap, py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          {BRAND.name} · Hecho para el fútbol de los domingos.
        </Typography>
      </Box>
    </Box>
  );
}
