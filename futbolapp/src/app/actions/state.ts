"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ATTRS, isStatus } from "@/lib/state";

export type StateFormState = { error?: string; ok?: string } | undefined;

// Actualizar "Mi estado". Si ya cargaste uno hace menos de 12 horas, se corrige ese en vez de sumar otro.
export async function saveStateAction(_prev: StateFormState, formData: FormData): Promise<StateFormState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Tu sesión venció. Volvé a ingresar." };
  const me = await prisma.player.findUnique({ where: { userId }, select: { id: true } });
  if (!me) return { error: "No encontramos tu perfil de jugador." };

  const vals: Record<string, number> = {};
  for (const a of ATTRS) {
    const n = Number(formData.get(a.id));
    if (!Number.isInteger(n) || n < 1 || n > 10) return { error: "Los atributos van del 1 al 10." };
    vals[a.id] = n;
  }
  const status = String(formData.get("status") ?? "");
  if (!isStatus(status)) return { error: "Elegí cómo estás." };
  const note = String(formData.get("note") ?? "").trim().slice(0, 120);

  const last = await prisma.stateEntry.findFirst({ where: { playerId: me.id }, orderBy: { createdAt: "desc" } });
  const data = { speed: vals.speed, stamina: vals.stamina, power: vals.power, technique: vals.technique, defense: vals.defense, status, note: note || null };
  if (last && Date.now() - last.createdAt.getTime() < 12 * 3_600_000) {
    await prisma.stateEntry.update({ where: { id: last.id }, data });
  } else {
    await prisma.stateEntry.create({ data: { playerId: me.id, ...data } });
  }
  revalidatePath("/carrera");
  revalidatePath("/partidos", "layout");
  return { ok: "Estado actualizado." };
}
