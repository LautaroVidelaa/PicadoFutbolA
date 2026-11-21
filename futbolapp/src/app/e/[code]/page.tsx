import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { auth } from "@/auth";
import Crest from "@/lib/crests";
import InviteShell from "@/components/InviteShell";
import { Tag } from "@/components/ui";
import { joinTeamAction } from "@/app/actions/invites";
import { prisma } from "@/lib/prisma";
import { formatLabel } from "@/lib/teams";

export const metadata: Metadata = { title: "Invitación a un equipo" };

export default async function InvitePage({ params }: PageProps<"/e/[code]">) {
  const { code } = await params;
  const [session, team] = await Promise.all([
    auth(),
    prisma.team.findUnique({
      where: { inviteCode: code },
      include: { _count: { select: { members: { where: { leftAt: null } } } } },
    }),
  ]);

  if (!team) {
    return (
      <InviteShell>
        <Typography variant="h2" sx={{ fontSize: "2.6rem" }}>Este link ya no sirve.</Typography>
        <Typography color="text.secondary">
          Puede que el capitán lo haya renovado. Pedile uno nuevo y volvé a intentar.
        </Typography>
        <Button variant="contained" href="/">Ir al inicio</Button>
      </InviteShell>
    );
  }

  const userId = session?.user?.id;
  const already = userId
    ? await prisma.teamMember.findFirst({
        where: { teamId: team.id, leftAt: null, player: { userId } },
        select: { id: true },
      })
    : null;
  const next = encodeURIComponent(`/e/${code}`);

  return (
    <InviteShell>
      <Typography sx={{ fontWeight: 700, color: "text.secondary" }}>Te invitaron a jugar en</Typography>
      <Crest crest={{ preset: team.crestPreset, url: team.crestUrl }} name={team.name} color={team.color} size={110} />
      <Typography variant="h1" sx={{ fontSize: "clamp(2.4rem, 8vw, 3.6rem)", overflowWrap: "anywhere" }}>{team.name}</Typography>
      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", justifyContent: "center" }}>
        <Tag tone="neutral">{formatLabel(team.format)}</Tag>
        {team.zone && <Tag tone="neutral">{team.zone}</Tag>}
        <Tag tone="neutral">{team._count.members} {team._count.members === 1 ? "jugador" : "jugadores"}</Tag>
      </Box>
      {team.description && <Typography color="text.secondary">{team.description}</Typography>}

      {already ? (
        <>
          <Typography sx={{ fontWeight: 700 }}>Ya sos parte de este equipo.</Typography>
          <Button variant="contained" size="large" href={`/equipos/${team.id}`}>Ver el equipo</Button>
        </>
      ) : userId ? (
        <form action={joinTeamAction.bind(null, code)}>
          <Button type="submit" variant="contained" size="large">Unirme al equipo</Button>
        </form>
      ) : (
        <Box sx={{ display: "grid", gap: 1.5, justifyItems: "center", mt: 1 }}>
          <Button variant="contained" size="large" href={`/registro?next=${next}`}>Crear mi cuenta y unirme</Button>
          <Typography variant="body2" color="text.secondary">
            ¿Ya tenés cuenta? <Box component="a" href={`/login?next=${next}`} sx={{ fontWeight: 700, color: "inherit" }}>Ingresar</Box>
          </Typography>
        </Box>
      )}
    </InviteShell>
  );
}
