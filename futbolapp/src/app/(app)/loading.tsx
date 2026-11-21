import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

// Mientras carga una pantalla se ve su esqueleto, así la app se siente rápida
export default function Loading() {
  return (
    <Box aria-busy="true" aria-label="Cargando" sx={{ display: "grid", gap: 3 }}>
      <Box>
        <Skeleton variant="rounded" width="min(420px, 80%)" height={64} sx={{ borderRadius: "14px" }} />
        <Skeleton variant="text" width="min(300px, 60%)" sx={{ mt: 1.5 }} />
      </Box>
      <Skeleton variant="rounded" height={200} sx={{ borderRadius: "20px" }} />
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" } }}>
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={96} sx={{ borderRadius: "16px" }} />)}
      </Box>
      <Skeleton variant="rounded" height={160} sx={{ borderRadius: "16px" }} />
    </Box>
  );
}
