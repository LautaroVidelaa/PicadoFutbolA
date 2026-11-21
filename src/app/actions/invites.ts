"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyUsers, userIdsOfPlayers } from "@/lib/notify";
import { randomCode } from "@/lib/codes";
import { isPosition } from "@/lib/player";

export type InviteState = { error?: string; ok?: string } | undefined;

async function currentPlayer() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  return prisma.player.findUnique({ where: { userId } });
}

/** ¿Este jugador es capitán activo del equipo? */
async function isCaptain(teamId: string, playerId: string) {
  const m = await prisma.teamMember.findFirst({
    where: { teamId, playerId, role: "CAPTAIN", leftAt: null },
    select: { id: true },
  });
  return !!m;
}

// Genera un link nuevo y deja sin efecto el anterior
export async function renewInviteLinkAction(teamId: string) {
  const me = await currentPlayer();
  if (!me || !(await isCaptain(teamId, me.id))) return;
  await prisma.team.update({ where: { id: teamId }, data: { inviteCode: randomCode(10) } });
  revalidatePath(`/equipos/${teamId}`);
}

// Entrar a un equipo con el link de invitación
export async function joinTeamAction(code: string) {
  const me = await currentPlayer();
  if (!me) redirect(`/login?next=${encodeURIComponent(`/e/${code}`)}`);

  const team = await prisma.team.findUnique({ where: { inviteCode: code }, select: { id: true, name: true } });
  if (!team) redirect(`/e/${code}`);

  // Si ya había estado y se fue, vuelve a entrar; si ya está, no pasa nada
  const before = await prisma.teamMember.findUnique({ where: { teamId_playerId: { teamId: team.id, playerId: me.id } }, select: { leftAt: true } });
  await prisma.teamMember.upsert({
    where: { teamId_playerId: { teamId: team.id, playerId: me.id } },
    create: { teamId: team.id, playerId: me.id, role: "REGULAR" },
    update: { leftAt: null },
  });
  // Avisa a los capitanes que alguien nuevo entró
  if (!before || before.leftAt) {
    const caps = await prisma.teamMember.findMany({ where: { teamId: team.id, role: "CAPTAIN", leftAt: null }, select: { playerId: true } });
    await notifyUsers(await userIdsOfPlayers(caps.map((c) => c.playerId)), {
      title: `${me.firstName} se sumó a ${team.name}`,
      href: `/equipos/${team.id}`,
    });
  }
  revalidatePath("/equipos");
  redirect(`/equipos/${team.id}`);
}

// El capitán suma a alguien que todavía no tiene cuenta
export async function addGuestPlayerAction(
  teamId: string,
  _prev: InviteState,
  formData: FormData
): Promise<InviteState> {
  const me = await currentPlayer();
  if (!me || !(await isCaptain(teamId, me.id))) return { error: "Solo el capitán puede sumar jugadores." };

  const firstName = String(formData.get("firstName") ?? "").trim().slice(0, 60);
  const lastName = String(formData.get("lastName") ?? "").trim().slice(0, 60);
  const position = String(formData.get("position") ?? "");
  if (!firstName) return { error: "Escribí el nombre del jugador." };
  if (position && !isPosition(position)) return { error: "Elegí una posición válida." };

  const session = await auth();
  await prisma.player.create({
    data: {
      firstName,
      lastName: lastName || null,
      position: position ? (position as "GK" | "DEF" | "MID" | "FWD") : null,
      createdById: session!.user!.id,
      claimCode: randomCode(12),
      teams: { create: { teamId, role: "REGULAR" } },
    },
  });
  revalidatePath(`/equipos/${teamId}`);
  return { ok: `${firstName} ya está en el plantel.` };
}

// El capitán saca a alguien del plantel (queda en el historial con fecha de salida)
export async function removeMemberAction(teamId: string, memberId: string) {
  const me = await currentPlayer();
  if (!me || !(await isCaptain(teamId, me.id))) return;
  const member = await prisma.teamMember.findFirst({ where: { id: memberId, teamId, leftAt: null } });
  if (!member || member.role === "CAPTAIN") return;
  await prisma.teamMember.update({ where: { id: memberId }, data: { leftAt: new Date() } });
  revalidatePath(`/equipos/${teamId}`);
}

// Un jugador se va del equipo (el capitán no puede irse mientras sea capitán)
export async function leaveTeamAction(teamId: string) {
  const me = await currentPlayer();
  if (!me) return;
  const member = await prisma.teamMember.findFirst({ where: { teamId, playerId: me.id, leftAt: null } });
  if (!member || member.role === "CAPTAIN") return;
  await prisma.teamMember.update({ where: { id: member.id }, data: { leftAt: new Date() } });
  revalidatePath("/equipos");
  redirect("/equipos");
}

// Reclamar un jugador cargado por otra persona: todo su historial pasa a tu perfil
export async function claimPlayerAction(code: string) {
  const me = await currentPlayer();
  if (!me) redirect(`/login?next=${encodeURIComponent(`/reclamar/${code}`)}`);

  const ghost = await prisma.player.findFirst({ where: { claimCode: code, userId: null } });
  if (!ghost || ghost.id === me.id) redirect("/equipos");

  await prisma.$transaction(async (tx) => {
    // Plantel: si ya estás en ese equipo, se descarta el duplicado
    const ghostMemberships = await tx.teamMember.findMany({ where: { playerId: ghost.id } });
    for (const tm of ghostMemberships) {
      const mine = await tx.teamMember.findUnique({
        where: { teamId_playerId: { teamId: tm.teamId, playerId: me.id } },
      });
      if (mine) await tx.teamMember.delete({ where: { id: tm.id } });
      else await tx.teamMember.update({ where: { id: tm.id }, data: { playerId: me.id } });
    }
    // Partidos jugados
    const ghostMatches = await tx.matchPlayer.findMany({ where: { playerId: ghost.id } });
    for (const mp of ghostMatches) {
      const mine = await tx.matchPlayer.findUnique({
        where: { matchId_playerId: { matchId: mp.matchId, playerId: me.id } },
      });
      if (mine) await tx.matchPlayer.delete({ where: { id: mp.id } });
      else await tx.matchPlayer.update({ where: { id: mp.id }, data: { playerId: me.id } });
    }
    // Goles y asistencias
    await tx.goal.updateMany({ where: { scorerId: ghost.id }, data: { scorerId: me.id } });
    await tx.goal.updateMany({ where: { assisterId: ghost.id }, data: { assisterId: me.id } });
    await tx.match.updateMany({ where: { mvpId: ghost.id }, data: { mvpId: me.id } });
    // Valoraciones dadas y recibidas
    await tx.playerRating.updateMany({ where: { raterId: ghost.id }, data: { raterId: me.id } });
    await tx.playerRating.updateMany({ where: { ratedId: ghost.id }, data: { ratedId: me.id } });
    // Si en tu perfil faltaban datos, se completan con los que cargaron
    await tx.player.update({
      where: { id: me.id },
      data: { position: me.position ?? ghost.position, number: me.number ?? ghost.number },
    });
    await tx.player.delete({ where: { id: ghost.id } });
  });

  revalidatePath("/", "layout");
  redirect("/equipos");
}
