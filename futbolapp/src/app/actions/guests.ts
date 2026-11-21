"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type GuestPhotoResult = { error?: string; ok?: boolean };

// Poner (o sacar) la foto de un jugador que todavía no tiene cuenta.
// Pueden hacerlo quien lo cargó y los capitanes de un equipo donde juega.
export async function setGuestPhotoAction(playerId: string, photo: string | null): Promise<GuestPhotoResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Tu sesión venció. Volvé a ingresar." };

  const guest = await prisma.player.findUnique({ where: { id: playerId }, select: { userId: true, createdById: true } });
  if (!guest || guest.userId) return { error: "Esa persona ya tiene cuenta y carga su propia foto." };

  let allowed = guest.createdById === userId;
  if (!allowed) {
    const cap = await prisma.teamMember.findFirst({
      where: {
        role: "CAPTAIN", leftAt: null, player: { userId },
        team: { members: { some: { playerId, leftAt: null } } },
      },
      select: { id: true },
    });
    allowed = !!cap;
  }
  if (!allowed) return { error: "No podés cambiar la foto de este jugador." };

  if (photo !== null) {
    if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(photo) || photo.length > 150_000) {
      return { error: "La foto no es válida o pesa demasiado." };
    }
  }
  await prisma.player.update({ where: { id: playerId }, data: { photoUrl: photo } });
  revalidatePath("/", "layout");
  return { ok: true };
}
