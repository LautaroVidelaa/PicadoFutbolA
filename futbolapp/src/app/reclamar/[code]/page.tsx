import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { auth } from "@/auth";
import Avatar from "@/components/Avatar";
import InviteShell from "@/components/InviteShell";
import { Tag } from "@/components/ui";
import { claimPlayerAction } from "@/app/actions/invites";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Reclamar tu perfil" };

export default async function ClaimPage({ params }: PageProps<"/reclamar/[code]">) {
  const { code } = await params;
  const [session, ghost] = await Promise.all([
    auth(),
    prisma.player.findFirst({
      where: { claimCode: code, userId: null },
      include: { teams: { where: { leftAt: null }, include: { team: { select: { name: true } } } } },
    }),
  ]);

  if (!ghost) {
    return (
      <InviteShell>
        <Typography variant="h2" sx={{ fontSize: "2.6rem" }}>Este link ya fue usado.</Typography>
        <Typography color="text.secondary">Si ya reclamaste tu perfil, lo vas a ver en tu cuenta.</Typography>
        <Button variant="contained" href="/inicio">Ir a mi inicio</Button>
      </InviteShell>
    );
  }

  const name = [ghost.firstName, ghost.lastName].filter(Boolean).join(" ");
  const next = encodeURIComponent(`/reclamar/${code}`);

  return (
    <InviteShell>
      <Avatar name={name} size={84} square />
      <Typography variant="h1" sx={{ fontSize: "clamp(2.4rem, 8vw, 3.6rem)", overflowWrap: "anywhere" }}>¿Sos {name}?</Typography>
      <Typography color="text.secondary">
        Te cargaron como jugador. Si sos vos, todo lo que jugaste pasa a tu perfil.
      </Typography>
      {ghost.teams.length > 0 && (
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", justifyContent: "center" }}>
          {ghost.teams.map((t) => <Tag key={t.id} tone="neutral">{t.team.name}</Tag>)}
        </Box>
      )}
      {session?.user?.id ? (
        <form action={claimPlayerAction.bind(null, code)}>
          <Button type="submit" variant="contained" size="large">Sí, soy yo</Button>
        </form>
      ) : (
        <Box sx={{ display: "grid", gap: 1.5, justifyItems: "center" }}>
          <Button variant="contained" size="large" href={`/registro?next=${next}`}>Crear mi cuenta</Button>
          <Typography variant="body2" color="text.secondary">
            ¿Ya tenés cuenta? <Box component="a" href={`/login?next=${next}`} sx={{ fontWeight: 700, color: "inherit" }}>Ingresar</Box>
          </Typography>
        </Box>
      )}
    </InviteShell>
  );
}
