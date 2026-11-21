import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

export function Card({
  children,
  sx,
  tone = "light",
  component = "section",
  className,
}: {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  tone?: "light" | "navy";
  component?: React.ElementType;
  className?: string;
}) {
  return (
    <Box
      component={component}
      className={className}
      sx={[
        {
          borderRadius: "18px",
          p: { xs: 2.25, md: 3 },
          minWidth: 0,
          ...(tone === "navy"
            ? {
                color: "#fff",
                background:
                  "linear-gradient(150deg, var(--c-hero-from) 0%, var(--c-hero-to) 100%)",
              }
            : { bgcolor: "var(--c-card)", border: "1px solid var(--c-border)" }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

const TAGS = {
  ok: ["var(--c-ok-bg)", "var(--c-ok-text)"],
  warn: ["var(--c-warn-bg)", "var(--c-warn-text)"],
  bad: ["var(--c-bad-bg)", "var(--c-bad-text)"],
  neutral: ["var(--c-neutral-bg)", "var(--c-muted)"],
  brand: ["var(--c-brand)", "var(--c-brand-text)"],
  navy: ["var(--c-text)", "#fff"],
} as const;

export function Tag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: keyof typeof TAGS;
}) {
  const [bg, fg] = TAGS[tone];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.25,
        py: 0.4,
        borderRadius: 999,
        bgcolor: bg,
        color: fg,
        fontSize: "0.8rem",
        fontWeight: 700,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Box>
  );
}

export function PageHead({
  title,
  lead,
  action,
}: {
  title: React.ReactNode;
  lead?: string;
  action?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { sm: "flex-end" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        mb: { xs: 3, md: 4 },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h1" sx={{ fontSize: "clamp(2.6rem, 7vw, 4.6rem)", mb: lead ? 1.25 : 0 }}>
          {title}
        </Typography>
        {lead && (
          <Typography color="text.secondary" sx={{ maxWidth: "52ch" }}>
            {lead}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}

export function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2, mb: 1.75 }}>
      <Typography variant="h3" sx={{ fontSize: "1.8rem" }}>
        {children}
      </Typography>
      {aside}
    </Box>
  );
}

export function BigNumber({
  value,
  label,
  onDark = false,
}: {
  value: React.ReactNode;
  label: string;
  onDark?: boolean;
}) {
  return (
    <Box>
      <Box
        sx={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "clamp(2.2rem, 5vw, 3rem)",
          lineHeight: 0.95,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </Box>
      <Box sx={{ mt: 0.5, fontSize: "0.9rem", color: onDark ? "var(--c-sidebar-muted)" : "text.secondary" }}>
        {label}
      </Box>
    </Box>
  );
}

// Camiseta/escudo simple para identificar a un equipo por color
export function TeamDot({ color, size = 28 }: { color: "team1" | "team2" | "team3"; size?: number }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        bgcolor: `var(--c-${color})`,
        border: "2px solid",
        borderColor: color === "team1" ? "rgba(255,255,255,.7)" : color === "team3" ? "var(--c-text)" : "transparent",
        boxShadow: "inset 0 0 0 2px rgba(255,255,255,.25)",
      }}
    />
  );
}

export function ResultBadge({ r }: { r: "G" | "E" | "P" }) {
  const map = { G: ["ok", "G"], E: ["neutral", "E"], P: ["bad", "P"] } as const;
  const [tone, t] = map[r];
  return <Tag tone={tone}>{t}</Tag>;
}

// Número grande con título y una línea de contexto (fila de estadísticas)
export function StatTile({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <Card className="lift" sx={{ p: { xs: 2, md: 2.5 } }}>
      <Box sx={{ fontSize: "0.88rem", color: "text.secondary", fontWeight: 600, mb: 0.75 }}>{label}</Box>
      <Box
        sx={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "clamp(2.4rem, 5vw, 3.2rem)",
          lineHeight: 0.95,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </Box>
      {sub && <Box sx={{ mt: 0.75, fontSize: "0.82rem", color: "text.secondary" }}>{sub}</Box>}
    </Card>
  );
}

// Barra horizontal simple (para partidos por equipo, valoraciones, etc.)
export function Bar({ value, max, tone = "navy" }: { value: number; max: number; tone?: "navy" | "accent" | "brand" }) {
  const color = { navy: "var(--c-text)", accent: "var(--c-accent)", brand: "var(--c-brand)" }[tone];
  return (
    <Box role="presentation" sx={{ height: 8, borderRadius: 999, bgcolor: "var(--c-neutral-bg)", overflow: "hidden" }}>
      <Box sx={{ width: `${Math.min(100, (value / max) * 100)}%`, height: "100%", bgcolor: color, borderRadius: 999 }} />
    </Box>
  );
}
