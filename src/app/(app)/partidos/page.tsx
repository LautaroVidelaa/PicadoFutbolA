import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import A from "@/components/A";
import Icon from "@/components/Icon";
import MatchRow from "@/components/MatchRow";
import { Card, PageHead } from "@/components/ui";
import { toMatchView } from "@/lib/matchView";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Partidos" };

export default async function PartidosPage({ searchParams }: PageProps<"/partidos">) {
  const [{ tab }, user] = await Promise.all([searchParams, requireUser()]);
  const current = tab === "historial" ? "historial" : "proximos";

  const matches = await prisma.match.findMany({
    // Los partidos de los equipos en los que estás, o en los que te convocaron
    where: {
      status: current === "historial" ? "FINISHED" : { not: "FINISHED" },
      OR: [
        { createdById: user.id },
        { homeTeam: { members: { some: { leftAt: null, player: { userId: user.id } } } } },
        { players: { some: { player: { userId: user.id } } } },
      ],
    },
    include: { homeTeam: true, awayTeam: true, players: { select: { attendance: true } } },
    orderBy: { playedAt: current === "historial" ? "desc" : "asc" },
    take: 60,
  });

  const tabs = [
    ["proximos", "Próximos"],
    ["historial", "Historial"],
  ] as const;

  return (
    <>
      <PageHead
        title="Partidos"
        lead="Armá la convocatoria, compartí el link por WhatsApp y mirá quién confirma."
        action={
          <Button variant="contained" size="large" href="/partidos/nuevo" startIcon={<Icon name="plus" size={20} />}>
            Crear partido
          </Button>
        }
      />
      <Box role="tablist" aria-label="Tipo de partidos" sx={{ display: "inline-flex", p: 0.5, gap: 0.5, mb: 3, borderRadius: 999, bgcolor: "var(--c-neutral-bg)" }}>
        {tabs.map(([key, label]) => {
          const on = key === current;
          return (
            <A key={key} role="tab" aria-selected={on} href={`/partidos?tab=${key}`} sx={{ px: 2.5, py: 1, borderRadius: 999, fontWeight: 700, textDecoration: "none", bgcolor: on ? "var(--c-text)" : "transparent", color: on ? "#fff" : "var(--c-muted)" }}>
              {label}
            </A>
          );
        })}
      </Box>

      {matches.length === 0 ? (
        <Card sx={{ textAlign: "center", py: { xs: 5, md: 8 }, display: "grid", justifyItems: "center", gap: 2 }}>
          <Typography variant="h3" sx={{ fontSize: "2.4rem" }}>
            {current === "proximos" ? "No hay partidos a la vista." : "Todavía no hay partidos jugados."}
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: "44ch" }}>
            {current === "proximos"
              ? "Organizá el próximo picado: elegís el equipo, el rival y el día, y mandás el link."
              : "Cuando cargues el resultado de un partido, va a quedar acá."}
          </Typography>
          {current === "proximos" && (
            <Button variant="contained" size="large" href="/partidos/nuevo" startIcon={<Icon name="plus" size={20} />}>
              Organizar un partido
            </Button>
          )}
        </Card>
      ) : (
        <Box sx={{ display: "grid", gap: 1.25 }}>
          {matches.map((m) => (
            <MatchRow key={m.id} m={toMatchView(m)} />
          ))}
        </Box>
      )}
    </>
  );
}
