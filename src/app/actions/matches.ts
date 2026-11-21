"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { randomCode } from "@/lib/codes";
import { isPosition } from "@/lib/player";
import { MAX_TRAITS, RATE_WINDOW_DAYS, TRAIT_IDS } from "@/lib/ratings";
import { dayShort, parsePlayedAt, timeOf } from "@/lib/matches";
import { isOrganizer } from "@/lib/matchSides";
import { notifyUsers, userIdsOfPlayers } from "@/lib/notify";
import { FORMATS, VISIBILITY_OPTIONS } from "@/lib/teams";

export type MatchFormState = { error?: string } | undefined;

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function createMatchAction(_prev: MatchFormState, formData: FormData): Promise<MatchFormState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Tu sesión venció. Volvé a ingresar." };
  const me = await prisma.player.findUnique({ where: { userId } });
  if (!me) return { error: "No encontramos tu perfil de jugador." };

  // "pickup" = picado abierto: se anotan jugadores y después se arman los dos equipos
  const pickup = text(formData, "kind") === "pickup";

  let team: { id: string; name: string; members: { playerId: string }[] } | null = null;
  let awayName = "";
  if (!pickup) {
    // Entre equipos: solo el capitán organiza partidos de su equipo
    team = await prisma.team.findFirst({
      where: { id: text(formData, "teamId"), members: { some: { playerId: me.id, role: "CAPTAIN", leftAt: null } } },
      include: { members: { where: { leftAt: null }, select: { playerId: true } } },
    });
    if (!team) return { error: "Elegí un equipo del que seas capitán." };
    awayName = text(formData, "awayName").slice(0, 40);
    if (awayName.length < 2) return { error: "Escribí el nombre del equipo rival." };
  }

  const offset = Number(text(formData, "tzOffset") || 180);
  const playedAt = parsePlayedAt(text(formData, "date"), text(formData, "time"), Number.isFinite(offset) ? offset : 180);
  if (!playedAt) return { error: "Elegí la fecha y la hora del partido." };
  const now = Date.now();
  if (playedAt.getTime() > now + 366 * 86_400_000) return { error: "La fecha está demasiado lejos." };
  if (playedAt.getTime() < now - 2 * 366 * 86_400_000) return { error: "La fecha es demasiado vieja." };

  const venue = text(formData, "venue").slice(0, 80);
  const notes = text(formData, "notes").slice(0, 300);
  const format = Number(text(formData, "format"));
  if (!(FORMATS as readonly number[]).includes(format)) return { error: "Elegí el formato de juego." };
  const visibility = text(formData, "visibility");
  if (!VISIBILITY_OPTIONS.some((v) => v.value === visibility)) return { error: "Elegí quién puede ver el partido." };

  const match = await prisma.match.create({
    data: {
      shareCode: randomCode(8),
      playersPerSide: format,
      homeTeamId: team?.id ?? null,
      homeName: pickup ? "Equipo A" : null,
      awayName: pickup ? "Equipo B" : awayName,
      playedAt,
      venue: venue || null,
      notes: notes || null,
      visibility: visibility as "LINK" | "PUBLIC" | "PRIVATE",
      createdById: userId,
      players: {
        create: team
          ? // Se convoca a todo el plantel; quien organiza ya queda confirmado
            team.members.map((m) => ({
              playerId: m.playerId,
              side: "HOME" as const,
              attendance: m.playerId === me.id ? ("CONFIRMED" as const) : ("PENDING" as const),
            }))
          : [{ playerId: me.id, side: null, attendance: "CONFIRMED" as const }],
      },
    },
    select: { id: true },
  });

  // Avisa a los del plantel que hay partido
  if (team) {
    const others = team.members.map((m) => m.playerId).filter((id) => id !== me.id);
    await notifyUsers(await userIdsOfPlayers(others), {
      title: `Nuevo partido de ${team.name}`,
      body: `${dayShort(playedAt)} · ${timeOf(playedAt)} hs${venue ? ` · ${venue}` : ""}. ¿Venís?`,
      href: `/partidos/${match.id}`,
    });
  }

  revalidatePath("/partidos");
  redirect(`/partidos/${match.id}`);
}

const refresh = (matchId: string) => {
  revalidatePath(`/partidos/${matchId}`);
  revalidatePath("/partidos");
  revalidatePath("/explorar");
};

async function currentPlayer() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const me = await prisma.player.findUnique({ where: { userId } });
  return me ? { userId, me } : null;
}

// Confirmar o bajarse de un partido. Lo hace el propio jugador o quien organiza por él
// (por ejemplo, para quien todavía no tiene cuenta).
export async function setAttendanceAction(
  matchId: string,
  playerId: string,
  status: "CONFIRMED" | "DECLINED" | "PENDING"
) {
  const cur = await currentPlayer();
  if (!cur) return;
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { createdById: true, homeTeamId: true, playersPerSide: true, status: true },
  });
  if (!match || match.status !== "SCHEDULED") return;

  const isSelf = cur.me.id === playerId;
  if (!isSelf && !(await isOrganizer(match, cur.userId))) return;

  // En un picado abierto no se puede pasar el cupo total
  if (status === "CONFIRMED" && !match.homeTeamId) {
    const confirmed = await prisma.matchPlayer.count({ where: { matchId, attendance: "CONFIRMED", NOT: { playerId } } });
    if (confirmed >= match.playersPerSide * 2) return;
  }
  const data = status === "CONFIRMED" ? { attendance: status } : { attendance: status, side: match.homeTeamId ? undefined : null, posX: null, posY: null };
  await prisma.matchPlayer.updateMany({ where: { matchId, playerId }, data });
  refresh(matchId);
}

// Anotarse en un picado abierto (desde el link o desde la búsqueda)
export async function joinMatchAction(matchId: string) {
  const cur = await currentPlayer();
  if (!cur) return;
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { homeTeamId: true, visibility: true, status: true, playersPerSide: true, playedAt: true, createdById: true },
  });
  if (!match || match.homeTeamId || match.status !== "SCHEDULED" || match.visibility === "PRIVATE") return;
  const confirmed = await prisma.matchPlayer.count({ where: { matchId, attendance: "CONFIRMED", NOT: { playerId: cur.me.id } } });
  if (confirmed >= match.playersPerSide * 2) return;
  const already = await prisma.matchPlayer.findUnique({ where: { matchId_playerId: { matchId, playerId: cur.me.id } }, select: { attendance: true } });
  await prisma.matchPlayer.upsert({
    where: { matchId_playerId: { matchId, playerId: cur.me.id } },
    create: { matchId, playerId: cur.me.id, attendance: "CONFIRMED", side: null },
    update: { attendance: "CONFIRMED" },
  });
  if (already?.attendance !== "CONFIRMED" && match.createdById !== cur.userId) {
    await notifyUsers([match.createdById], { title: `${cur.me.firstName} se anotó a tu picado`, href: `/partidos/${matchId}` });
  }
  refresh(matchId);
}

// Pasar un jugador de un equipo al otro (o sacarlo de ambos) en un picado abierto
export async function setSideAction(matchId: string, playerId: string, side: "HOME" | "AWAY" | null) {
  const cur = await currentPlayer();
  if (!cur) return;
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { createdById: true, homeTeamId: true, playersPerSide: true, status: true },
  });
  if (!match || match.homeTeamId || match.status !== "SCHEDULED" || !(await isOrganizer(match, cur.userId))) return;
  if (side) {
    const inSide = await prisma.matchPlayer.count({ where: { matchId, side, attendance: "CONFIRMED", NOT: { playerId } } });
    if (inSide >= match.playersPerSide) return;
  }
  await prisma.matchPlayer.updateMany({ where: { matchId, playerId, attendance: "CONFIRMED" }, data: { side, posX: null, posY: null } });
  refresh(matchId);
}

// Sortear los equipos: reparte parejo, y trata de que los arqueros y cada posición queden repartidos
export async function shuffleSidesAction(matchId: string) {
  const cur = await currentPlayer();
  if (!cur) return;
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { createdById: true, homeTeamId: true, playersPerSide: true, status: true },
  });
  if (!match || match.homeTeamId || match.status !== "SCHEDULED" || !(await isOrganizer(match, cur.userId))) return;

  const confirmed = await prisma.matchPlayer.findMany({
    where: { matchId, attendance: "CONFIRMED" },
    include: { player: { select: { position: true } } },
  });
  const shuffle = <T,>(a: T[]) => {
    const r = [...a];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  };
  const order = ["GK", "DEF", "MID", "FWD", "NONE"];
  const groups = order.map((k) => shuffle(confirmed.filter((p) => (p.player.position ?? "NONE") === k)));
  const queue = groups.flat().slice(0, match.playersPerSide * 2);
  let turn = Math.random() < 0.5 ? 0 : 1;
  const home: string[] = [];
  const away: string[] = [];
  for (const p of queue) {
    (turn === 0 ? home : away).push(p.id);
    turn = 1 - turn;
  }
  await prisma.$transaction([
    prisma.matchPlayer.updateMany({ where: { matchId }, data: { side: null, posX: null, posY: null } }),
    prisma.matchPlayer.updateMany({ where: { id: { in: home } }, data: { side: "HOME" } }),
    prisma.matchPlayer.updateMany({ where: { id: { in: away } }, data: { side: "AWAY" } }),
  ]);
  refresh(matchId);
}

export type FormationState = { error?: string; ok?: boolean } | undefined;

// Guarda dónde está cada jugador en la cancha (porcentajes de 0 a 100)
export async function saveFormationAction(matchId: string, _prev: FormationState, formData: FormData): Promise<FormationState> {
  const cur = await currentPlayer();
  if (!cur) return { error: "Tu sesión venció. Volvé a ingresar." };
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { createdById: true, homeTeamId: true },
  });
  if (!match || !(await isOrganizer(match, cur.userId))) return { error: "Solo quien organiza puede armar la formación." };

  let list: { id: string; x: number; y: number }[];
  try {
    list = JSON.parse(String(formData.get("positions") ?? "[]"));
  } catch {
    return { error: "No pudimos leer la formación." };
  }
  if (!Array.isArray(list) || list.length > 40) return { error: "La formación no es válida." };
  const ok = list.every((p) => typeof p.id === "string" && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100);
  if (!ok) return { error: "La formación no es válida." };

  const valid = await prisma.matchPlayer.findMany({
    where: { matchId, id: { in: list.map((p) => p.id) }, attendance: "CONFIRMED", side: { not: null } },
    select: { id: true },
  });
  const allowed = new Set(valid.map((v) => v.id));
  await prisma.$transaction(
    list.filter((p) => allowed.has(p.id)).map((p) => prisma.matchPlayer.update({ where: { id: p.id }, data: { posX: p.x, posY: p.y } }))
  );
  refresh(matchId);
  return { ok: true };
}

export type ResultState = { error?: string } | undefined;

const score = (v: FormDataEntryValue | null) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= 99 ? n : null;
};

// Carga (o corrige) el resultado: marcador, goles con asistencia y figura. Solo quien organiza.
export async function saveResultAction(matchId: string, _prev: ResultState, formData: FormData): Promise<ResultState> {
  const cur = await currentPlayer();
  if (!cur) return { error: "Tu sesión venció. Volvé a ingresar." };

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { players: { select: { playerId: true, side: true, attendance: true } } },
  });
  if (!match) return { error: "No encontramos el partido." };
  if (!(await isOrganizer(match, cur.userId))) return { error: "Solo quien organiza puede cargar el resultado." };

  const homeScore = score(formData.get("homeScore"));
  const awayScore = score(formData.get("awayScore"));
  if (homeScore === null || awayScore === null) return { error: "Cargá el marcador con números del 0 al 99." };

  // Entre equipos solo se cargan jugadores del local; en un picado, de los dos lados
  const pickup = !match.homeTeamId;
  const sideOf = new Map<string, "HOME" | "AWAY">();
  for (const p of match.players) {
    if (p.attendance !== "CONFIRMED") continue;
    if (pickup && p.side) sideOf.set(p.playerId, p.side);
    if (!pickup && p.side === "HOME") sideOf.set(p.playerId, "HOME");
  }
  const scorers = formData.getAll("scorer").map(String);
  const assisters = formData.getAll("assister").map(String);
  const goals: { scorerId: string; assisterId: string | null; side: "HOME" | "AWAY" }[] = [];
  for (let i = 0; i < scorers.length; i++) {
    if (!scorers[i]) continue;
    const a = assisters[i] || null;
    const side = sideOf.get(scorers[i]);
    if (!side || (a && sideOf.get(a) !== side)) return { error: "El goleador y quien asistió tienen que ser del mismo equipo y estar en el partido." };
    if (a === scorers[i]) return { error: "Nadie se asiste a sí mismo." };
    goals.push({ scorerId: scorers[i], assisterId: a, side });
  }
  if (goals.filter((g) => g.side === "HOME").length > homeScore || goals.filter((g) => g.side === "AWAY").length > awayScore) {
    return { error: "Cargaste más goles que el marcador de un equipo." };
  }

  const mvp = String(formData.get("mvp") ?? "");
  if (mvp && !sideOf.has(mvp)) return { error: "La figura tiene que ser parte del partido." };

  await prisma.$transaction([
    prisma.goal.deleteMany({ where: { matchId } }),
    prisma.goal.createMany({
      data: goals.map((g) => ({ matchId, teamId: match.homeTeamId, side: g.side, scorerId: g.scorerId, assisterId: g.assisterId })),
    }),
    prisma.match.update({
      where: { id: matchId },
      data: { status: "FINISHED", homeScore, awayScore, mvpId: mvp || null },
    }),
  ]);

  // La primera vez que se carga, se avisa a todos los que jugaron
  if (match.status !== "FINISHED") {
    const played = match.players.filter((p) => p.attendance === "CONFIRMED" && p.playerId !== cur.me.id).map((p) => p.playerId);
    await notifyUsers(await userIdsOfPlayers(played), {
      title: `Resultado cargado: ${homeScore} - ${awayScore}`,
      body: "Entrá a ver cómo fue y valorá a tus compañeros.",
      href: `/partidos/${matchId}`,
    });
  }

  revalidatePath("/partidos");
  revalidatePath("/inicio");
  redirect(`/partidos/${matchId}`);
}

export type GuestState = { error?: string; ok?: string } | undefined;

// Quien organiza suma a alguien que no usa la app: queda anotado y confirmado en el partido
export async function addGuestToMatchAction(matchId: string, _prev: GuestState, formData: FormData): Promise<GuestState> {
  const cur = await currentPlayer();
  if (!cur) return { error: "Tu sesión venció. Volvé a ingresar." };
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { createdById: true, homeTeamId: true, playersPerSide: true, status: true },
  });
  if (!match || !(await isOrganizer(match, cur.userId))) return { error: "Solo quien organiza puede sumar jugadores." };
  if (match.status !== "SCHEDULED") return { error: "El partido ya terminó." };

  const firstName = String(formData.get("firstName") ?? "").trim().slice(0, 60);
  const lastName = String(formData.get("lastName") ?? "").trim().slice(0, 60);
  const position = String(formData.get("position") ?? "");
  if (!firstName) return { error: "Escribí el nombre del jugador." };
  if (position && !isPosition(position)) return { error: "Elegí una posición válida." };

  const pickup = !match.homeTeamId;
  let side: "HOME" | "AWAY" | null = pickup ? null : "HOME";
  if (pickup) {
    const wanted = String(formData.get("side") ?? "");
    if (wanted === "HOME" || wanted === "AWAY") side = wanted;
    const confirmed = await prisma.matchPlayer.count({ where: { matchId, attendance: "CONFIRMED" } });
    if (confirmed >= match.playersPerSide * 2) return { error: "El picado ya está completo." };
    if (side) {
      const inSide = await prisma.matchPlayer.count({ where: { matchId, side, attendance: "CONFIRMED" } });
      if (inSide >= match.playersPerSide) return { error: "Ese equipo ya está completo." };
    }
  }
  const toTeam = !pickup && formData.get("toTeam") === "on";

  await prisma.player.create({
    data: {
      firstName,
      lastName: lastName || null,
      position: position ? (position as "GK" | "DEF" | "MID" | "FWD") : null,
      createdById: cur.userId,
      claimCode: randomCode(12),
      matches: { create: { matchId, side, attendance: "CONFIRMED" } },
      ...(toTeam && match.homeTeamId ? { teams: { create: { teamId: match.homeTeamId, role: "REGULAR" as const } } } : {}),
    },
  });
  refresh(matchId);
  return { ok: `${firstName} quedó anotado.` };
}

export type RatingState = { error?: string; ok?: string } | undefined;

// Valorar a los compañeros del mismo equipo después del partido
export async function saveRatingsAction(matchId: string, _prev: RatingState, formData: FormData): Promise<RatingState> {
  const cur = await currentPlayer();
  if (!cur) return { error: "Tu sesión venció. Volvé a ingresar." };
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { players: { select: { playerId: true, side: true, attendance: true } } },
  });
  if (!match || match.status !== "FINISHED") return { error: "El partido todavía no terminó." };
  if (Date.now() - match.playedAt.getTime() > RATE_WINDOW_DAYS * 86_400_000) return { error: "Ya pasó el plazo para valorar este partido." };

  const mine = match.players.find((p) => p.playerId === cur.me.id && p.attendance === "CONFIRMED" && p.side);
  if (!mine) return { error: "Solo quienes jugaron pueden valorar." };
  const mates = new Set(
    match.players.filter((p) => p.attendance === "CONFIRMED" && p.side === mine.side && p.playerId !== cur.me.id).map((p) => p.playerId)
  );

  const ops = [];
  for (const id of mates) {
    const raw = String(formData.get(`score:${id}`) ?? "");
    if (!raw) continue;
    const score = Number(raw);
    if (!Number.isInteger(score) || score < 1 || score > 10) return { error: "Las notas van del 1 al 10." };
    const traits = [...new Set(formData.getAll(`traits:${id}`).map(String).filter((t) => TRAIT_IDS.includes(t)))].slice(0, MAX_TRAITS);
    ops.push(
      prisma.playerRating.upsert({
        where: { matchId_raterId_ratedId: { matchId, raterId: cur.me.id, ratedId: id } },
        create: { matchId, raterId: cur.me.id, ratedId: id, score, traits: traits.join(",") },
        update: { score, traits: traits.join(",") },
      })
    );
  }
  if (ops.length === 0) return { error: "Poné al menos una nota." };
  await prisma.$transaction(ops);
  revalidatePath(`/partidos/${matchId}`);
  revalidatePath("/carrera");
  revalidatePath("/inicio");
  return { ok: "Listo, tus valoraciones quedaron guardadas." };
}
