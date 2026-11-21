import { prisma } from "@/lib/prisma";

type Note = { title: string; body?: string; href: string };

/** Avisos dentro de la app. Recibe ids de USUARIOS; si falla, no rompe la acción que lo llamó. */
export async function notifyUsers(userIds: (string | null | undefined)[], note: Note) {
  const ids = [...new Set(userIds.filter((x): x is string => !!x))];
  if (ids.length === 0) return;
  try {
    await prisma.notification.createMany({
      data: ids.map((userId) => ({ userId, title: note.title.slice(0, 120), body: note.body?.slice(0, 200) ?? null, href: note.href })),
    });
  } catch {
    // los avisos son un extra: nunca tiran abajo la acción principal
  }
}

/** Ids de usuario (con cuenta) de una lista de jugadores. */
export async function userIdsOfPlayers(playerIds: string[]) {
  if (playerIds.length === 0) return [];
  const rows = await prisma.player.findMany({ where: { id: { in: playerIds }, userId: { not: null } }, select: { userId: true } });
  return rows.map((r) => r.userId as string);
}
