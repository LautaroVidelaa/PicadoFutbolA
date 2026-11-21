"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { safeNext } from "@/lib/safe";

export type FormState = { error?: string } | undefined;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!firstName) return { error: "Ingresá tu nombre." };
  if (!EMAIL_REGEX.test(email)) return { error: "Ingresá un email válido." };
  if (password.length < 8) {
    return { error: "La contraseña tiene que tener al menos 8 caracteres." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Ya existe una cuenta con ese email." };

  // Nunca guardamos la contraseña: solo su hash
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    // Creamos la cuenta (User) y su identidad futbolística (Player) juntas
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: `${firstName} ${lastName}`.trim(),
        player: { create: { firstName, lastName: lastName || null } },
      },
    });
  } catch (e) {
    // P2002 = violación de unicidad (otro registro con el mismo email llegó primero)
    if ((e as { code?: string }).code === "P2002") {
      return { error: "Ya existe una cuenta con ese email." };
    }
    throw e;
  }

  // Si todo salió bien, iniciamos sesión y vamos al inicio
  await signIn("credentials", { email, password, redirectTo: safeNext(formData.get("next")) });
}

export async function loginAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirectTo: safeNext(formData.get("next")) });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Email o contraseña incorrectos. Revisalos e intentá de nuevo." };
    }
    // Next.js usa un "error" interno para redirigir: hay que volver a lanzarlo
    throw e;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
