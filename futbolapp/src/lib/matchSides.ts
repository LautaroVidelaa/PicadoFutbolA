import { prisma } from "@/lib/prisma";

export type SideInfo = { name: string; preset: string | null; url: string | null; color: string };

type TeamLike = { name: string; crestPreset: string | null; crestUrl: string | null; color: string };

const fromTeam = (t: TeamLike): SideInfo => ({ name: t.name, preset: t.crestPreset, url: t.crestUrl, color: t.color });

/** Los dos lados de un partido, sea entre equipos o un picado abierto (Equipo A / Equipo B). */
export function sidesOf(m: {
  homeTeam: TeamLike | null;
  homeName: string | null;
  awayTeam: TeamLike | null;
  awayName: string | null;
  homePreset?: string | null;
  homeUrl?: string | null;
  awayPreset?: string | null;
  awayUrl?: string | null;
}): { home: SideInfo; away: SideInfo } {
  return {
    home: m.homeTeam ? fromTeam(m.homeTeam) : { name: m.homeName ?? "Equipo A", preset: m.homePreset ?? null, url: m.homeUrl ?? null, color: "#0E1A3A" },
    away: m.awayTeam ? fromTeam(m.awayTeam) : { name: m.awayName ?? "Rival", preset: m.awayPreset ?? null, url: m.awayUrl ?? null, color: "#75AADB" },
  };
}

/** Quien organiza: el que creó el partido o el capitán del equipo local. */
export async function isOrganizer(match: { createdById: string; homeTeamId: string | null }, userId: string) {
  if (match.createdById === userId) return true;
  if (!match.homeTeamId) return false;
  const c = await prisma.teamMember.findFirst({
    where: { teamId: match.homeTeamId, role: "CAPTAIN", leftAt: null, player: { userId } },
    select: { id: true },
  });
  return !!c;
}
