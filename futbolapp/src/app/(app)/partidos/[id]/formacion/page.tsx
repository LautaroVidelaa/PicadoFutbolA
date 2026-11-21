import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Card, PageHead } from "@/components/ui";
import { isOrganizer, sidesOf } from "@/lib/matchSides";
import { photoVer } from "@/lib/player";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import FormationEditor from "./FormationEditor";

export const metadata: Metadata = { title: "Formación" };

export default async function FormacionPage({ params }: PageProps<"/partidos/[id]/formacion">) {
  const [{ id }, user] = await Promise.all([params, requireUser()]);
  const match = await prisma.match.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true, players: { include: { player: true } } },
  });
  if (!match) notFound();
  if (!(await isOrganizer(match, user.id))) redirect(`/partidos/${id}`);
  const { home, away } = sidesOf(match);
  const pickup = !match.homeTeamId;

  const players = match.players
    .filter((p) => p.attendance === "CONFIRMED" && p.side !== null)
    .map((p) => ({
      id: p.id,
      name: p.player.firstName,
      number: p.player.number,
      position: p.player.position,
      side: p.side as "HOME" | "AWAY",
      x: p.posX,
      y: p.posY,
      playerId: p.playerId,
      ver: photoVer(p.player.photoUrl),
    }));

  return (
    <>
      <PageHead title="Armá la formación." lead="Elegí una formación o arrastrá a cada jugador a su lugar. También podés usar las flechas del teclado." />
      <Card>
        {players.length === 0 ? (
          <p>Todavía no hay jugadores confirmados{pickup ? " con equipo" : ""}. Volvé al partido para armarlos.</p>
        ) : (
          <FormationEditor matchId={id} players={players} mode={pickup ? "split" : "full"} homeName={home.name} awayName={away.name} perSide={match.playersPerSide} />
        )}
      </Card>
    </>
  );
}
