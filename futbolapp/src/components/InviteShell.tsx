import Box from "@mui/material/Box";
import Logo from "@/components/Logo";

// Marco simple para las pantallas a las que se llega con un link (invitación, reclamar)
export default function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", gridTemplateRows: "auto 1fr", px: 2.5, py: 3 }}>
      <Box sx={{ maxWidth: 560, width: "100%", mx: "auto" }}>
        <Logo href="/" />
      </Box>
      <Box sx={{ display: "grid", alignContent: "center", py: 4 }}>
        <Box sx={{ maxWidth: 560, width: "100%", mx: "auto", borderRadius: "24px", bgcolor: "var(--c-card)", border: "1px solid var(--c-border)", p: { xs: 3, md: 4.5 }, textAlign: "center", display: "grid", justifyItems: "center", gap: 2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
