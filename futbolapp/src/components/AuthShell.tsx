import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Logo from "@/components/Logo";
import Pitch from "@/components/Pitch";

// Pantalla dividida: a la izquierda una pizarra con una formación (solo en escritorio),
// a la derecha el formulario.
export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 5fr) minmax(0, 6fr)" },
      }}
    >
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
          bgcolor: "#0E1A3A",
          color: "#EAF0FF",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0 56px, transparent 56px 112px)",
        }}
      >
        <Logo />
        <Box sx={{ width: "100%", maxWidth: 300, mx: "auto", transform: "rotate(-2deg)", boxShadow: "0 24px 48px -20px rgba(0,0,0,.6)", borderRadius: "14px" }}>
          <Pitch />
        </Box>
        <Typography sx={{ color: "rgba(234,240,255,.8)", maxWidth: "34ch" }}>
          Organizá tus partidos y armá tu historial, juegues con el equipo que juegues.
        </Typography>
      </Box>

      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 2.5, sm: 6, md: 10 },
          py: { xs: 3, md: 8 },
        }}
      >
        <Box sx={{ display: { xs: "block", md: "none" }, mb: 6 }}>
          <Logo />
        </Box>
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Typography
            variant="h1"
            sx={{ fontSize: { xs: "3.4rem", md: "4.4rem" }, mb: 1.5 }}
          >
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, maxWidth: "38ch" }}>
            {subtitle}
          </Typography>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
