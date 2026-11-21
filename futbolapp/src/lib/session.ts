import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isPosition, type Position } from "@/lib/player";

export type CurrentUser = {
  id: string;
  /** id del jugador (perfil de cancha) de este usuario */
  playerId: string | null;
  firstName: string;
  fullName: string;
  lastName: string;
  position: Position | null;
  number: number | null;
  since: string;
};

// Usuario logueado + su jugador. Sin sesión, manda al login.
// cache() evita repetir la consulta en el mismo request (layout + página).
export const requireUser = cache(async (): Promise<CurrentUser> => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const player = await prisma.player.findUnique({ where: { userId: session.user.id } });
  const firstName = player?.firstName ?? session.user.name ?? "Jugador";
  const fullName = [player?.firstName, player?.lastName].filter(Boolean).join(" ") || firstName;
  return {
    id: session.user.id,
    playerId: player?.id ?? null,
    firstName,
    fullName,
    lastName: player?.lastName ?? "",
    position: isPosition(player?.position) ? player.position : null,
    number: player?.number ?? null,
    since: (player?.createdAt ?? new Date()).toLocaleDateString("es-AR", { month: "long", year: "numeric" }),
  };
});
