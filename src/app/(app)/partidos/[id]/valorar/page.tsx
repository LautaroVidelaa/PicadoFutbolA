import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Card, PageHead } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { RATE_WINDOW_DAYS } from "@/lib/ratings";
import RatingForm from "./RatingForm";

export const metadata: Metadata = { title: "Valorar compañeros" };

export default async function ValorarPage({ params }: PageProps<"/partidos/[id]/valorar">) {
  const [{ id }, user] = await Promise.all([params, requireUser()]);
  if (!user.playerId) redirect(`/partidos/${id}`);
  const match = await prisma.match.findUnique({
    where: { id },
    include: { players: { include: { player: true } } },
  });
  if (!match) notFound();
  const mine = match.players.find((p) => p.playerId === user.playerId && p.attendance === "CONFIRMED" && p.side);
  if (!mine || match.status !== "FINISHED") redirect(`/partidos/${id}`);

  const given = await prisma.playerRating.findMany({ where: { matchId: id, raterId: user.playerId } });
  const mates = match.players
    .filter((p) => p.attendance === "CONFIRMED" && p.side === mine.side && p.playerId !== user.playerId)
    .map((p) => {
      const g = given.find((x) => x.ratedId === p.playerId);
      return {
        id: p.playerId,
        name: [p.player.firstName, p.player.lastName].filter(Boolean).join(" "),
        score: g?.score ?? null,
        traits: g?.traits ? g.traits.split(",") : [],
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <PageHead title="Valorá a tus compañeros." lead={`Es anónimo: cada uno ve solo el promedio, y recién desde 3 valoraciones. Tenés ${RATE_WINDOW_DAYS} días para hacerlo.`} />
      {mates.length === 0 ? <Card>No hay compañeros de tu equipo para valorar en este partido.</Card> : <RatingForm matchId={id} mates={mates} />}
    </>
  );
}
