import { prisma } from "@/lib/prisma";

// Próximo partido programado donde el usuario juega (o es capitán del local)
export async function nextMatchFor(userId: string) {
  return prisma.match.findFirst({
    where: {
      status: "SCHEDULED",
      playedAt: { gte: new Date(Date.now() - 3 * 3_600_000) },
      OR: [
        { players: { some: { player: { userId }, attendance: { not: "DECLINED" } } } },
        { createdById: userId },
        { homeTeam: { members: { some: { leftAt: null, role: "CAPTAIN", player: { userId } } } } },
      ],
    },
    orderBy: { playedAt: "asc" },
    include: { homeTeam: true, awayTeam: true, players: { select: { attendance: true } } },
  });
}
