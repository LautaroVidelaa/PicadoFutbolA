"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function markAllReadAction() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;
  await prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/", "layout");
}

export async function markReadAction(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;
  await prisma.notification.updateMany({ where: { id, userId, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/", "layout");
}
