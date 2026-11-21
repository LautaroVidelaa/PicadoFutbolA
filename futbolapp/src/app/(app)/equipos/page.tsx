import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import A from "@/components/A";
import Icon from "@/components/Icon";
import Crest from "@/lib/crests";
import { Card, PageHead, Tag } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ROLE_LABEL, VISIBILITY_OPTIONS, formatLabel } from "@/lib/teams";

export const metadata: Metadata = { title: "Equipos" };

export default async function EquiposPage() {
  const user = await requireUser();
  const teams = await prisma.team.findMany({
    where: { members: { some: { leftAt: null, player: { userId: user.id } } } },
    include: {
      _count: { select: { members: { where: { leftAt: null } } } },
      members: { where: { leftAt: null, player: { userId: user.id } }, select: { role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHead
        title="Tus equipos."
        lead="Distintas camisetas. El mismo jugador. Tu carrera te sigue a donde juegues."
        action={
          <Button variant="contained" size="large" href="/equipos/nuevo" startIcon={<Icon name="plus" size={20} />}>
            Crear equipo
          </Button>
        }
      />

      {teams.length === 0 ? (
        <Card sx={{ textAlign: "center", py: { xs: 5, md: 8 }, display: "grid", justifyItems: "center", gap: 2 }}>
          <Crest crest={{}} name="?" size={84} />
          <Typography variant="h3" sx={{ fontSize: "2.4rem" }}>Todavía no tenés equipo.</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: "44ch" }}>
            Creá el tuyo con su escudo y su camiseta, o esperá a que te sumen a uno.
          </Typography>
          <Button variant="contained" size="large" href="/equipos/nuevo" startIcon={<Icon name="plus" size={20} />}>
            Crear mi primer equipo
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0,1fr)", md: "repeat(2, minmax(0,1fr))", xl: "repeat(3, minmax(0,1fr))" } }}>
          {teams.map((t) => {
            const role = t.members[0]?.role ?? "REGULAR";
            const vis = VISIBILITY_OPTIONS.find((v) => v.value === t.visibility)?.label;
            return (
              <A
                key={t.id}
                href={`/equipos/${t.id}`}
                className="lift"
                sx={{ display: "block", textDecoration: "none", color: "inherit", borderRadius: "18px", overflow: "hidden", border: "1px solid var(--c-border)", bgcolor: "var(--c-card)" }}
              >
                <Box sx={{ height: 12, bgcolor: t.color }} />
                <Box sx={{ p: 2.5, display: "flex", gap: 2, alignItems: "center" }}>
                  <Crest crest={{ preset: t.crestPreset, url: t.crestUrl }} name={t.name} color={t.color} size={68} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h4" sx={{ fontSize: "1.8rem", overflowWrap: "anywhere" }}>{t.name}</Typography>
                    {t.zone && <Box sx={{ color: "text.secondary", fontSize: "0.88rem" }}>{t.zone}</Box>}
                  </Box>
                </Box>
                <Box sx={{ px: 2.5, pb: 2.5, display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                  <Tag tone="neutral">{formatLabel(t.format)}</Tag>
                  <Tag tone={role === "CAPTAIN" ? "brand" : "neutral"}>{ROLE_LABEL[role]}</Tag>
                  <Tag tone="neutral">{t._count.members} {t._count.members === 1 ? "jugador" : "jugadores"}</Tag>
                  {vis && <Tag tone="neutral">{vis}</Tag>}
                </Box>
              </A>
            );
          })}
        </Box>
      )}
    </>
  );
}
