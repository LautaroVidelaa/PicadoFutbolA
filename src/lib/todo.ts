import { prisma } from "@/lib/prisma";
import { dayShort, timeOf } from "@/lib/matches";
import { sidesOf } from "@/lib/matchSides";

export type TodoItem = { id: string; title: string; text: string; href: string; cta: string; tone: "brand" | "warn" | "ok" };

/** Lo que te toca hacer ahora: solo confirmar si vas a los partidos a los que te convocaron. */
export async function loadTodos(playerId: string | null): Promise<TodoItem[]> {
  if (!playerId) return [];
  const now = Date.now();
  const items: TodoItem[] = [];

  // 1) Partidos a los que te convocaron y no respondiste
  const pending = await prisma.matchPlayer.findMany({
    where: { playerId, attendance: "PENDING", match: { status: "SCHEDULED", playedAt: { gte: new Date(now) } } },
    include: { match: { include: { homeTeam: true, awayTeam: true } } },
    orderBy: { match: { playedAt: "asc" } },
    take: 5,
  });
  for (const p of pending) {
    const { home, away } = sidesOf(p.match);
    items.push({
      id: `conf-${p.id}`,
      title: "¿Vas a jugar?",
      text: `${home.name} vs ${away.name} · ${dayShort(p.match.playedAt)} ${timeOf(p.match.playedAt)} hs`,
      href: `/partidos/${p.matchId}`,
      cta: "Responder",
      tone: "brand",
    });
  }

  return items.slice(0, 5);
}

export type Step = { id: string; label: string; hint: string; href: string; done: boolean };

/** Primeros pasos para alguien nuevo. */
export async function loadOnboarding(
  playerId: string | null,
  user: { position: string | null; number: number | null }
): Promise<Step[]> {
  if (!playerId) return [];
  const [me, teams, played, finished] = await Promise.all([
    prisma.player.findUnique({ where: { id: playerId }, select: { photoUrl: true } }),
    prisma.teamMember.count({ where: { playerId, leftAt: null } }),
    prisma.matchPlayer.count({ where: { playerId, attendance: "CONFIRMED" } }),
    prisma.matchPlayer.count({ where: { playerId, attendance: "CONFIRMED", match: { status: "FINISHED" } } }),
  ]);
  return [
    { id: "perfil", label: "Completá tu perfil", hint: "Posición y número de camiseta", href: "/perfil", done: !!user.position && user.number != null },
    { id: "foto", label: "Subí tu foto", hint: "Así te reconocen tus compañeros", href: "/perfil", done: !!me?.photoUrl },
    { id: "equipo", label: "Sumate a un equipo", hint: "Creá el tuyo o entrá con un link", href: "/equipos", done: teams > 0 },
    { id: "partido", label: "Armá o anotate a un picado", hint: "Es lo que más se usa", href: "/partidos/nuevo", done: played > 0 },
    { id: "resultado", label: "Jugá tu primer partido con resultado", hint: "Ahí arranca tu carrera", href: "/partidos", done: finished > 0 },
  ];
}
