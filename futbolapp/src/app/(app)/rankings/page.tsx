import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import A from "@/components/A";
import { Card, PageHead } from "@/components/ui";
import { loadRankings, type RankKey } from "@/lib/career";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Rankings" };

const CATS: Record<RankKey, { label: string; unit: string }> = {
  goles: { label: "Goleadores", unit: "goles" },
  asistencias: { label: "Asistidores", unit: "asist." },
  mvp: { label: "Figuras", unit: "veces" },
  rating: { label: "Rating", unit: "pts" },
};

export default async function RankingsPage({ searchParams }: PageProps<"/rankings">) {
  const [{ cat }, user] = await Promise.all([searchParams, requireUser()]);
  const key: RankKey = typeof cat === "string" && cat in CATS ? (cat as RankKey) : "goles";
  const all = user.playerId ? await loadRankings(user.playerId) : null;
  const rows = all?.[key] ?? [];
  const c = CATS[key];

  return (
    <>
      <PageHead title="Entre amigos, también se compite." lead="Quién mete más goles, quién asiste mejor y quién se lleva la figura. Solo con la gente con la que jugaste." />
      <Box role="tablist" aria-label="Categoría" sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
        {(Object.keys(CATS) as RankKey[]).map((k) => {
          const on = k === key;
          return (
            <A key={k} role="tab" aria-selected={on} href={`/rankings?cat=${k}`} sx={{ px: 2.25, py: 1, borderRadius: 999, fontWeight: 700, textDecoration: "none", border: "1.5px solid var(--c-text)", bgcolor: on ? "var(--c-text)" : "transparent", color: on ? "#fff" : "var(--c-text)" }}>
              {CATS[k].label}
            </A>
          );
        })}
      </Box>
      {rows.length === 0 ? (
        <Card sx={{ textAlign: "center", py: { xs: 5, md: 7 }, display: "grid", justifyItems: "center", gap: 1.5 }}>
          <Typography variant="h3" sx={{ fontSize: "2rem" }}>Todavía no hay nada para ordenar.</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: "46ch" }}>
            El ranking se arma con los resultados que se cargan después de cada partido. Jugá, cargá el resultado y acá aparecen los números.
          </Typography>
          <Button variant="contained" href="/partidos/nuevo">Organizar un partido</Button>
        </Card>
      ) : (
        <Card sx={{ p: { xs: 1, md: 2 } }}>
          <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 0.5 }}>
            {rows.map((row, i) => {
              const me = row.playerId === user.playerId;
              return (
                <Box
                  component="li"
                  key={row.playerId}
                  sx={{ display: "grid", gridTemplateColumns: "44px minmax(0,1fr) auto", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: "12px", bgcolor: me ? "var(--c-brand)" : i === 0 ? "var(--c-tint)" : "transparent", color: me ? "var(--c-brand-text)" : "inherit" }}
                >
                  <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "2rem", lineHeight: 1, textAlign: "center" }}>{i + 1}</Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>{me ? `${user.firstName} (vos)` : row.name}</Box>
                    <Box sx={{ fontSize: "0.85rem", opacity: 0.75 }}>{row.team} · {row.pj} PJ</Box>
                  </Box>
                  <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.9rem", lineHeight: 1 }}>
                    {row.value} <Box component="span" sx={{ fontSize: "0.9rem", fontFamily: "var(--font-body)", fontWeight: 600, opacity: 0.7 }}>{c.unit}</Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Card>
      )}
    </>
  );
}
