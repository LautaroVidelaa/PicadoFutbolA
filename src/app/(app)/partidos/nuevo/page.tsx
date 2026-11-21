import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import MatchForm from "./MatchForm";

export const metadata: Metadata = { title: "Crear partido" };

export default async function NuevoPartidoPage({ searchParams }: PageProps<"/partidos/nuevo">) {
  const [{ equipo, tipo }, user] = await Promise.all([searchParams, requireUser()]);

  // Solo se puede organizar un partido de un equipo del que sos capitán
  const teams = await prisma.team.findMany({
    where: { members: { some: { role: "CAPTAIN", leftAt: null, player: { userId: user.id } } } },
    orderBy: { createdAt: "desc" },
  });

  const options = teams.map((t) => ({ id: t.id, name: t.name, format: t.format, color: t.color, preset: t.crestPreset, url: t.crestUrl }));
  const initial = options.find((t) => t.id === equipo)?.id ?? options[0]?.id ?? "";

  return (
    <>
      <PageHead title="Organizá un partido." lead="Entre equipos o picado abierto. Después mandás el link y cada uno confirma." />
      <MatchForm teams={options} initialTeamId={initial} initialKind={(equipo || tipo === "equipos") && options.length > 0 ? "teams" : "pickup"} />
    </>
  );
}
