import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHead } from "@/components/ui";
import { isOrganizer, sidesOf } from "@/lib/matchSides";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import ResultForm from "./ResultForm";

export const metadata: Metadata = { title: "Cargar resultado" };

export default async function ResultadoPage({ params }: PageProps<"/partidos/[id]/resultado">) {
  const [{ id }, user] = await Promise.all([params, requireUser()]);
  const match = await prisma.match.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true, goals: true, players: { include: { player: true } } },
  });
  if (!match) notFound();
  if (!(await isOrganizer(match, user.id))) redirect(`/partidos/${id}`);
  const { home, away } = sidesOf(match);
  const pickup = !match.homeTeamId;

  // Pueden figurar quienes confirmaron; en un picado, los de los dos equipos
  const players = match.players
    .filter((p) => p.attendance === "CONFIRMED" && (pickup ? p.side !== null : p.side === "HOME"))
    .map((p) => {
      const n = [p.player.firstName, p.player.lastName].filter(Boolean).join(" ");
      return { id: p.playerId, name: pickup ? `${n} (${p.side === "HOME" ? home.name : away.name})` : n };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <PageHead title="Cargar resultado." lead="Marcador, goles y la figura. Con esto se arma la carrera de cada jugador." />
      <ResultForm
        matchId={id}
        homeName={home.name}
        awayName={away.name}
        pickup={pickup}
        players={players}
        initial={{
          home: match.homeScore ?? 0,
          away: match.awayScore ?? 0,
          mvp: match.mvpId ?? "",
          goals: match.goals.map((g) => ({ scorer: g.scorerId, assister: g.assisterId ?? "" })),
        }}
      />
    </>
  );
}
