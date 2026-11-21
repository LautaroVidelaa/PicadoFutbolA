"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCrestPreset } from "@/lib/crests";
import { randomCode } from "@/lib/codes";
import {
  CREST_DATA_URL,
  FORMATS,
  MAX_CREST_CHARS,
  TEAM_COLORS,
  VISIBILITY_OPTIONS,
  defaultShortName,
} from "@/lib/teams";

export type TeamFormState = { error?: string } | undefined;

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function createTeamAction(_prev: TeamFormState, formData: FormData): Promise<TeamFormState> {
  // Quién crea el equipo sale de la sesión, nunca del formulario
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Tu sesión venció. Volvé a ingresar." };

  const player = await prisma.player.findUnique({ where: { userId } });
  if (!player) return { error: "No encontramos tu perfil de jugador." };

  const name = text(formData, "name").slice(0, 40);
  if (name.length < 3) return { error: "El nombre del equipo necesita al menos 3 letras." };

  const shortRaw = text(formData, "shortName").toUpperCase().replace(/[^A-Z0-9ÁÉÍÓÚÑ]/g, "");
  if (shortRaw && (shortRaw.length < 2 || shortRaw.length > 4)) {
    return { error: "La sigla va de 2 a 4 letras." };
  }
  const shortName = shortRaw || defaultShortName(name);

  const zone = text(formData, "zone").slice(0, 60);
  const description = text(formData, "description").slice(0, 200);

  const format = Number(text(formData, "format"));
  if (!(FORMATS as readonly number[]).includes(format)) return { error: "Elegí el formato de juego." };

  const color = text(formData, "color").toUpperCase();
  if (!TEAM_COLORS.some((c) => c.hex.toUpperCase() === color)) return { error: "Elegí un color de camiseta de la lista." };

  const visibility = text(formData, "visibility");
  if (!VISIBILITY_OPTIONS.some((v) => v.value === visibility)) return { error: "Elegí quién puede ver el equipo." };

  // Escudo: imagen subida (tiene prioridad) o uno de la galería
  const upload = text(formData, "crestUpload");
  const presetRaw = text(formData, "crestPreset");
  let crestUrl: string | null = null;
  let crestPreset: string | null = null;
  if (upload) {
    if (upload.length > MAX_CREST_CHARS || !CREST_DATA_URL.test(upload)) {
      return { error: "La imagen del escudo no es válida. Probá con una foto PNG, JPG o WebP más chica." };
    }
    crestUrl = upload;
  } else if (presetRaw) {
    if (!isCrestPreset(presetRaw)) return { error: "Ese escudo no existe." };
    crestPreset = presetRaw;
  }

  const team = await prisma.team.create({
    data: {
      name,
      shortName,
      zone: zone || null,
      description: description || null,
      format,
      color,
      visibility: visibility as "LINK" | "PUBLIC" | "PRIVATE",
      crestPreset,
      crestUrl,
      ownerId: userId,
      inviteCode: randomCode(10),
      // Quien lo crea queda como capitán, dentro del plantel
      members: { create: { playerId: player.id, role: "CAPTAIN" } },
    },
    select: { id: true },
  });

  revalidatePath("/equipos");
  redirect(`/equipos/${team.id}`);
}
