import { prisma } from "@/lib/prisma";
import { FORMATS } from "@/lib/teams";
import { isPosition } from "@/lib/player";

const MAX = 30;
const terms = (q: string) => q.split(/\s+/).filter(Boolean).slice(0, 4);
const fmt = (f?: string) => (FORMATS as readonly number[]).includes(Number(f)) ? Number(f) : undefined;

// Picados abiertos con lugares libres
export async function searchPickups(q: string, format?: string) {
  const rows = await prisma.match.findMany({
    where: {
      homeTeamId: null,
      visibility: "PUBLIC",
      status: "SCHEDULED",
      playedAt: { gte: new Date() },
      playersPerSide: fmt(format),
      ...(q ? { venue: { contains: q } } : {}),
    },
    orderBy: { playedAt: "asc" },
    take: 60,
    include: { homeTeam: true, awayTeam: true, players: { select: { attendance: true, player: { select: { userId: true } } } } },
  });
  return rows.filter((m) => m.players.filter((p) => p.attendance === "CONFIRMED").length < m.playersPerSide * 2).slice(0, MAX);
}

// Equipos públicos
export async function searchTeams(q: string, format?: string) {
  return prisma.team.findMany({
    where: {
      visibility: "PUBLIC",
      format: fmt(format),
      ...(q ? { OR: [{ name: { contains: q } }, { zone: { contains: q } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: MAX,
    include: { _count: { select: { members: { where: { leftAt: null } } } } },
  });
}

// Jugadores con cuenta que aceptan aparecer en la búsqueda
export async function searchPlayers(q: string, position?: string) {
  return prisma.player.findMany({
    where: {
      userId: { not: null },
      discoverable: true,
      position: position && isPosition(position) ? position : undefined,
      AND: terms(q).map((t) => ({ OR: [{ firstName: { contains: t } }, { lastName: { contains: t } }] })),
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    take: MAX,
    select: { id: true, firstName: true, lastName: true, position: true, number: true, userId: true },
  });
}
