import { prisma } from "@/lib/prisma";
import { toMatchView } from "@/lib/matchView";
import type { MatchView } from "@/lib/matches";
import { MIN_RATINGS_SHOWN, TRAITS } from "@/lib/ratings";

export type Outcome = "G" | "E" | "P";

export type Achievement = { title: string; text: string; done: boolean };

export type Career = {
  pj: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  assists: number;
  mvp: number;
  /** null hasta el primer partido con resultado */
  rating: number | null;
  ratingDelta: number;
  /** Evolución: arranca en el rating inicial y suma un punto por partido */
  series: number[];
  value: string | null;
  /** Últimos resultados, del más nuevo al más viejo */
  form: Outcome[];
  byTeam: { name: string; pj: number; goals: number; assists: number }[];
  achievements: Achievement[];
  /** Partidos jugados, del más nuevo al más viejo */
  matches: MatchView[];
  /** Lo que dicen los compañeros; el promedio aparece recién con {MIN_RATINGS_SHOWN} valoraciones */
  peer: { total: number; avg: number | null; traits: { id: string; label: string; value: number }[] };
};

export const START_RATING = 60;
const PICADOS = "Picados abiertos";

// Cómo cambia el rating con cada partido: resultado, goles, asistencias y figura.
// Es una fórmula simple y transparente; más adelante se le suman las valoraciones de los compañeros.
export function ratingDeltaFor(o: Outcome, goals: number, assists: number, mvp: boolean) {
  const result = o === "G" ? 1.5 : o === "E" ? 0.5 : -0.5;
  return 0.3 + result + Math.min(goals, 5) * 1.2 + Math.min(assists, 5) * 0.8 + (mvp ? 2 : 0);
}

const clampRating = (v: number) => Math.max(40, Math.min(99, v));

export function formatValue(rating: number | null) {
  if (rating == null) return null;
  const v = (rating - 40) ** 2 * 1000;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(".", ",")} M`;
  return `${Math.round(v / 1000)} K`;
}

/** Escala para el gráfico de evolución a partir de la serie. */
export function chartScale(series: number[]) {
  const lo = Math.max(30, Math.floor((Math.min(...series) - 5) / 10) * 10);
  const hi = Math.min(100, Math.ceil((Math.max(...series) + 5) / 10) * 10);
  const ticks: number[] = [];
  for (let t = lo + 10; t < hi; t += 10) ticks.push(t);
  return { min: lo, max: hi, ticks: ticks.length ? ticks : [Math.round((lo + hi) / 2)] };
}

type Played = {
  matchId: string;
  playedAt: Date;
  outcome: Outcome;
  goals: number;
  assists: number;
  mvp: boolean;
  team: string;
  view: MatchView;
  /** promedio de las notas que le pusieron en este partido */
  peer: number | null;
};

type Rated = { score: number; traits: string[] };

function build(played: Played[], rated: Rated[]): Career {
  played.sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());
  let acc = START_RATING;
  const series = [START_RATING];
  for (const p of played) {
    // Las notas de los compañeros mueven el rating: arriba de 6 suma, abajo resta
    acc += ratingDeltaFor(p.outcome, p.goals, p.assists, p.mvp) + (p.peer != null ? (p.peer - 6) * 0.4 : 0);
    series.push(Math.round(clampRating(acc)));
  }
  const pj = played.length;
  const rating = pj ? series[series.length - 1] : null;
  const back = series[Math.max(0, series.length - 1 - 5)];
  const sum = (f: (p: Played) => number) => played.reduce((n, p) => n + f(p), 0);

  const teams = new Map<string, { pj: number; goals: number; assists: number }>();
  for (const p of played) {
    const t = teams.get(p.team) ?? { pj: 0, goals: 0, assists: 0 };
    t.pj++; t.goals += p.goals; t.assists += p.assists;
    teams.set(p.team, t);
  }

  let streak = 0, best = 0;
  for (const p of played) {
    streak = p.outcome === "G" ? streak + 1 : 0;
    best = Math.max(best, streak);
  }
  const goals = sum((p) => p.goals);
  const assists = sum((p) => p.assists);
  const mvp = played.filter((p) => p.mvp).length;
  const maxGoals = Math.max(0, ...played.map((p) => p.goals));

  const achievements: Achievement[] = [
    { title: "Debut", text: "Jugaste tu primer partido", done: pj >= 1 },
    { title: "Primer gol", text: "Convertiste tu primer gol", done: goals >= 1 },
    { title: "Primera asistencia", text: "Diste tu primer pase de gol", done: assists >= 1 },
    { title: "Doblete", text: "2 goles en un mismo partido", done: maxGoals >= 2 },
    { title: "Hat-trick", text: "3 goles en un mismo partido", done: maxGoals >= 3 },
    { title: "Goleador", text: "10 goles en total", done: goals >= 10 },
    { title: "Asistidor", text: "10 asistencias en total", done: assists >= 10 },
    { title: "Figura", text: "Elegido figura del partido", done: mvp >= 1 },
    { title: "Racha de 3", text: "3 victorias seguidas", done: best >= 3 },
    { title: "Todoterreno", text: "Jugaste en 3 equipos distintos", done: teams.size >= 3 },
    { title: "Habitual", text: "10 partidos jugados", done: pj >= 10 },
  ];

  const newest = [...played].reverse();
  return {
    pj,
    wins: played.filter((p) => p.outcome === "G").length,
    draws: played.filter((p) => p.outcome === "E").length,
    losses: played.filter((p) => p.outcome === "P").length,
    goals,
    assists,
    mvp,
    rating,
    ratingDelta: rating == null ? 0 : rating - back,
    series,
    value: formatValue(rating),
    form: newest.slice(0, 5).map((p) => p.outcome),
    byTeam: [...teams.entries()].map(([name, t]) => ({ name, ...t })).sort((a, b) => b.pj - a.pj),
    achievements,
    matches: newest.map((p) => p.view),
    peer: {
      total: rated.length,
      avg: rated.length >= MIN_RATINGS_SHOWN ? Math.round((rated.reduce((n, r) => n + r.score, 0) / rated.length) * 10) / 10 : null,
      traits:
        rated.length >= MIN_RATINGS_SHOWN
          ? TRAITS.map((t) => ({ id: t.id, label: t.label, value: Math.round((rated.filter((r) => r.traits.includes(t.id)).length / rated.length) * 100) }))
              .filter((t) => t.value > 0)
              .sort((a, b) => b.value - a.value)
          : [],
    },
  };
}

/** Carreras de varios jugadores a partir de los partidos terminados en los que jugaron. */
export async function loadCareers(playerIds: string[]): Promise<Map<string, Career>> {
  const ids = [...new Set(playerIds)];
  const rows = await prisma.matchPlayer.findMany({
    where: {
      playerId: { in: ids },
      attendance: "CONFIRMED",
      side: { not: null },
      match: { status: "FINISHED", homeScore: { not: null }, awayScore: { not: null } },
    },
    include: {
      match: { include: { homeTeam: true, awayTeam: true, players: { select: { attendance: true } } } },
    },
  });
  const matchIds = [...new Set(rows.map((r) => r.matchId))];
  const goalRows = matchIds.length
    ? await prisma.goal.findMany({
        where: { matchId: { in: matchIds }, OR: [{ scorerId: { in: ids } }, { assisterId: { in: ids } }] },
        select: { matchId: true, scorerId: true, assisterId: true },
      })
    : [];

  const ratingRows = matchIds.length
    ? await prisma.playerRating.findMany({
        where: { ratedId: { in: ids }, matchId: { in: matchIds } },
        select: { matchId: true, ratedId: true, score: true, traits: true },
      })
    : [];
  const per = new Map<string, Played[]>(ids.map((id) => [id, []]));
  for (const r of rows) {
    const m = r.match;
    const hs = m.homeScore ?? 0;
    const as = m.awayScore ?? 0;
    const mine = r.side === "HOME" ? hs : as;
    const theirs = r.side === "HOME" ? as : hs;
    const g = goalRows.filter((x) => x.matchId === r.matchId);
    per.get(r.playerId)?.push({
      matchId: r.matchId,
      playedAt: m.playedAt,
      outcome: mine > theirs ? "G" : mine === theirs ? "E" : "P",
      goals: g.filter((x) => x.scorerId === r.playerId).length,
      assists: g.filter((x) => x.assisterId === r.playerId).length,
      mvp: m.mvpId === r.playerId,
      team: m.homeTeam && r.side === "HOME" ? m.homeTeam.name : m.awayTeam && r.side === "AWAY" ? m.awayTeam.name : PICADOS,
      view: toMatchView(m),
      peer: (() => {
        const rs = ratingRows.filter((x) => x.matchId === r.matchId && x.ratedId === r.playerId);
        return rs.length ? rs.reduce((n, x) => n + x.score, 0) / rs.length : null;
      })(),
    });
  }
  return new Map(
    ids.map((id) => [
      id,
      build(
        per.get(id) ?? [],
        ratingRows.filter((x) => x.ratedId === id).map((x) => ({ score: x.score, traits: x.traits ? x.traits.split(",") : [] }))
      ),
    ])
  );
}

export async function loadCareer(playerId: string) {
  return (await loadCareers([playerId])).get(playerId)!;
}

export type RankRow = { playerId: string; name: string; team: string; value: number; pj: number };
export type RankKey = "goles" | "asistencias" | "mvp" | "rating";

/** Ranking entre los que compartieron algún partido terminado con vos (y vos). */
export async function loadRankings(playerId: string) {
  const mine = await prisma.matchPlayer.findMany({
    where: { playerId, attendance: "CONFIRMED", match: { status: "FINISHED" } },
    select: { matchId: true },
  });
  const mates = mine.length
    ? await prisma.matchPlayer.findMany({
        where: { matchId: { in: mine.map((m) => m.matchId) }, attendance: "CONFIRMED", side: { not: null } },
        select: { player: { select: { id: true, firstName: true, lastName: true } } },
      })
    : [];
  const people = new Map<string, string>();
  for (const m of mates) people.set(m.player.id, [m.player.firstName, m.player.lastName].filter(Boolean).join(" "));
  const careers = await loadCareers([playerId, ...people.keys()]);

  const rows = [...careers.entries()]
    .filter(([, c]) => c.pj > 0)
    .map(([id, c]) => ({
      playerId: id,
      name: people.get(id) ?? "",
      team: c.byTeam[0]?.name ?? "",
      pj: c.pj,
      c,
    }));
  const pick = (f: (c: Career) => number, min: number): RankRow[] =>
    rows
      .map((r) => ({ playerId: r.playerId, name: r.name, team: r.team, pj: r.pj, value: f(r.c) }))
      .filter((r) => r.value >= min)
      .sort((a, b) => b.value - a.value || a.pj - b.pj || a.name.localeCompare(b.name))
      .slice(0, 20);
  return {
    goles: pick((c) => c.goals, 1),
    asistencias: pick((c) => c.assists, 1),
    mvp: pick((c) => c.mvp, 1),
    rating: pick((c) => c.rating ?? 0, 1),
  } satisfies Record<RankKey, RankRow[]>;
}
