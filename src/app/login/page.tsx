import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";
import { safeNext } from "@/lib/safe";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const safe = safeNext(typeof next === "string" ? next : null, "");
  return (
    <AuthShell
      title="Ingresá a tu cuenta"
      subtitle="Seguí con tus partidos y tu historial."
    >
      <LoginForm next={safe} />
    </AuthShell>
  );
}
