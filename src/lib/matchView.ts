import type { MatchView } from "@/lib/matches";
import { sidesOf } from "@/lib/matchSides";

type TeamLike = { name: string; crestPreset: string | null; crestUrl: string | null; color: string };
type DbMatch = {
  id: string;
  playedAt: Date;
  venue: string | null;
  playersPerSide: number;
  status: "SCHEDULED" | "FINISHED" | "CANCELLED";
  homeScore: number | null;
  awayScore: number | null;
  awayName: string | null;
  homeName: string | null;
  homeTeam: TeamLike | null;
  awayTeam: TeamLike | null;
  players: { attendance: "PENDING" | "CONFIRMED" | "DECLINED" }[];
};

// Pasa un partido de la base a lo que necesitan las filas y tarjetas
export function toMatchView(m: DbMatch): MatchView {
  const { home, away } = sidesOf(m);
  return {
    id: m.id,
    playedAt: m.playedAt,
    venue: m.venue,
    format: m.playersPerSide,
    home,
    away,
    confirmed: m.players.filter((p) => p.attendance === "CONFIRMED").length,
    needed: m.homeTeam ? m.playersPerSide : m.playersPerSide * 2,
    finished: m.status === "FINISHED",
    past: m.playedAt.getTime() < Date.now() - 3 * 3_600_000,
    score: m.status === "FINISHED" && m.homeScore != null && m.awayScore != null ? [m.homeScore, m.awayScore] : null,
  };
}
