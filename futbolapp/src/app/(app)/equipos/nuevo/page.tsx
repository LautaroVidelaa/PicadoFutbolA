import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import TeamForm from "./TeamForm";

export const metadata: Metadata = { title: "Crear equipo" };

export default function NuevoEquipoPage() {
  return (
    <>
      <PageHead title="Armá tu equipo." lead="Elegí el nombre, el escudo y el color. Después sumás a tus compañeros." />
      <TeamForm />
    </>
  );
}
