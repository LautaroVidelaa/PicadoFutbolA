"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isPosition } from "@/lib/player";

export type ProfileState = { error?: string; ok?: boolean } | undefined;

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  // El id sale de la sesión, nunca del formulario: nadie puede editar el perfil de otro
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Tu sesión venció. Volvé a ingresar." };

  const firstName = String(formData.get("firstName") ?? "").trim().slice(0, 60);
  const lastName = String(formData.get("lastName") ?? "").trim().slice(0, 60);
  const positionRaw = String(formData.get("position") ?? "");
  const numberRaw = String(formData.get("number") ?? "").trim();

  if (!firstName) return { error: "Ingresá tu nombre." };
  if (positionRaw && !isPosition(positionRaw)) return { error: "Elegí una posición válida." };

  let number: number | null = null;
  if (numberRaw !== "") {
    number = Number(numberRaw);
    if (!Number.isInteger(number) || number < 0 || number > 99) {
      return { error: "El número de camiseta va de 0 a 99." };
    }
  }

  // Foto: viene ya achicada desde el navegador. Se valida formato y peso.
  const photo = String(formData.get("photo") ?? "");
  let photoUrl: string | null | undefined;
  if (formData.get("removePhoto") === "1") photoUrl = null;
  else if (photo) {
    if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(photo) || photo.length > 150_000) {
      return { error: "La foto no es válida o pesa demasiado. Probá con otra." };
    }
    photoUrl = photo;
  }

  await prisma.$transaction([
    prisma.player.update({
      where: { userId },
      data: {
        firstName,
        lastName: lastName || null,
        position: positionRaw ? (positionRaw as "GK" | "DEF" | "MID" | "FWD") : null,
        number,
        ...(photoUrl !== undefined ? { photoUrl } : {}),
        discoverable: formData.get("discoverable") === "on",
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { name: `${firstName} ${lastName}`.trim() },
    }),
  ]);

  revalidatePath("/", "layout");
  return { ok: true };
}
