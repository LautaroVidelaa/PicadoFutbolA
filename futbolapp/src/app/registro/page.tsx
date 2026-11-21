import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";
import { safeNext } from "@/lib/safe";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegistroPage({ searchParams }: PageProps<"/registro">) {
  const { next } = await searchParams;
  const safe = safeNext(typeof next === "string" ? next : null, "");
  return (
    <AuthShell
      title="Creá tu cuenta"
      subtitle="Con tu cuenta se crea tu perfil de jugador. Después sumás equipos y partidos."
    >
      <RegisterForm next={safe} />
    </AuthShell>
  );
}
