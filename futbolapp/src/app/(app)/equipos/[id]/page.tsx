import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import A from "@/components/A";
import Avatar from "@/components/Avatar";
import GuestPhotoButton from "@/components/GuestPhotoButton";
import CopyButton from "@/components/CopyButton";
import Icon from "@/components/Icon";
import Crest from "@/lib/crests";
import { Card, SectionTitle, StatTile, Tag } from "@/components/ui";
import { leaveTeamAction, removeMemberAction, renewInviteLinkAction } from "@/app/actions/invites";
import { POSITIONS } from "@/lib/player";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ROLE_LABEL, VISIBILITY_OPTIONS, formatLabel } from "@/lib/teams";
import GuestForm from "./GuestForm";

export const metadata: Metadata = { title: "Equipo" };

const outlineOnDark = {
  color: "#fff",
  borderColor: "rgba(255,255,255,.5)",
  "&.Mui-disabled": { color: "rgba(255,255,255,.6)", borderColor: "rgba(255,255,255,.3)" },
} as const;

export default async function EquipoPage({ params }: PageProps<"/equipos/[id]">) {
  const [{ id }, user, h] = await Promise.all([params, requireUser(), headers()]);
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      // Solo el plantel actual: quien se fue queda en el historial pero no se muestra
      members: { where: { leftAt: null }, include: { player: true }, orderBy: { joinedAt: "asc" } },
    },
  });
  if (!team) notFound();
  const played = await prisma.match.findMany({
    where: { homeTeamId: id, status: "FINISHED", homeScore: { not: null }, awayScore: { not: null } },
    select: { homeScore: true, awayScore: true },
  });

  const me = team.members.find((m) => m.player.userId === user.id);
  // Un equipo privado solo lo ven sus integrantes
  if (team.visibility === "PRIVATE" && !me) notFound();
  const isCaptain = me?.role === "CAPTAIN";
  const vis = VISIBILITY_OPTIONS.find((v) => v.value === team.visibility)?.label;

  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${h.get("host") ?? "localhost:3000"}`;
  const inviteLink = team.inviteCode ? `${origin}/e/${team.inviteCode}` : null;
  const whatsapp = inviteLink
    ? `https://wa.me/?text=${encodeURIComponent(`Sumate a ${team.name} en picado.: ${inviteLink}`)}`
    : null;

  return (
    <>
      <A href="/equipos" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, mb: 2.5, fontWeight: 700, textDecoration: "none" }}>
        <Box sx={{ transform: "rotate(180deg)", display: "grid" }}><Icon name="arrowRight" size={18} /></Box> Equipos
      </A>

      <Box sx={{ borderRadius: "20px", overflow: "hidden", color: "#fff", background: "linear-gradient(150deg, var(--c-hero-from) 0%, var(--c-hero-to) 100%)", mb: 3 }}>
        <Box sx={{ height: 12, bgcolor: team.color }} />
        <Box sx={{ p: { xs: 2.5, md: 4 }, display: "flex", gap: { xs: 2.5, md: 4 }, alignItems: "center", flexWrap: "wrap" }}>
          <Box sx={{ p: 2, borderRadius: "24px", bgcolor: "var(--c-tint)", display: "grid", placeItems: "center" }}>
            <Crest crest={{ preset: team.crestPreset, url: team.crestUrl }} name={team.name} color={team.color} size={110} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Typography variant="h1" sx={{ fontSize: "clamp(2.6rem, 6vw, 4.2rem)", overflowWrap: "anywhere" }}>{team.name}</Typography>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1.5 }}>
              {team.shortName && <Tag tone="brand">{team.shortName}</Tag>}
              <Tag tone="neutral">{formatLabel(team.format)}</Tag>
              {team.zone && <Tag tone="neutral">{team.zone}</Tag>}
              {vis && <Tag tone="neutral">{vis}</Tag>}
            </Box>
            {team.description && <Typography sx={{ mt: 1.5, color: "var(--c-sidebar-muted)", maxWidth: "60ch" }}>{team.description}</Typography>}
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {isCaptain && <Button variant="contained" href="#invitar">Invitar jugadores</Button>}
            {isCaptain && <Button variant="outlined" href={`/partidos/nuevo?equipo=${team.id}`} sx={outlineOnDark}>Crear partido</Button>}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "grid", gap: { xs: 1.5, md: 3 }, gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" }, mb: 3 }}>
        <StatTile label="Jugadores" value={team.members.length} sub="En el plantel" />
        <StatTile label="Partidos" value={played.length} sub={played.length ? "Con resultado" : "Todavía no jugaron"} />
        <StatTile label="Victorias" value={played.filter((m) => (m.homeScore ?? 0) > (m.awayScore ?? 0)).length} />
        <StatTile label="Goles" value={played.reduce((n, m) => n + (m.homeScore ?? 0), 0)} />
      </Box>

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: isCaptain ? "minmax(0,3fr) minmax(0,2fr)" : "minmax(0,1fr)" }, alignItems: "start" }}>
        <Card>
          <SectionTitle>Plantel</SectionTitle>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {team.members.map((m) => {
              const full = [m.player.firstName, m.player.lastName].filter(Boolean).join(" ");
              const pos = POSITIONS.find((p) => p.value === m.player.position)?.label;
              const noAccount = m.player.userId == null;
              const isMe = m.player.userId === user.id;
              return (
                <Box component="li" key={m.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.25, flexWrap: "wrap", borderTop: "1px solid var(--c-border)", "&:first-of-type": { borderTop: 0 } }}>
                  <Avatar name={full} size={42} playerId={m.playerId} />
                  <Box sx={{ flex: 1, minWidth: 140 }}>
                    <Box sx={{ fontWeight: 800 }}>{full}{isMe ? " (vos)" : ""}</Box>
                    <Box sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                      {pos ?? "Sin posición"}{m.player.number != null ? ` · Camiseta ${m.player.number}` : ""}
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    {noAccount && <Tag tone="warn">Sin cuenta</Tag>}
                    <Tag tone={m.role === "CAPTAIN" ? "brand" : "neutral"}>{ROLE_LABEL[m.role]}</Tag>
                    {isCaptain && noAccount && m.player.claimCode && (
                      <CopyButton text={`${origin}/reclamar/${m.player.claimCode}`} label="Link para que lo reclame" variant="outlined" size="small" />
                    )}
                    {isCaptain && noAccount && <GuestPhotoButton playerId={m.playerId} name={full} hasPhoto={!!m.player.photoUrl} />}
                    {isCaptain && m.role !== "CAPTAIN" && (
                      <form action={removeMemberAction.bind(null, team.id, m.id)}>
                        <Button type="submit" size="small" color="inherit" sx={{ textDecoration: "underline" }} aria-label={`Quitar a ${full} del plantel`}>Quitar</Button>
                      </form>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
          {me && !isCaptain && (
            <form action={leaveTeamAction.bind(null, team.id)}>
              <Button type="submit" variant="outlined" color="inherit" sx={{ mt: 2 }}>Salir del equipo</Button>
            </form>
          )}
        </Card>

        {isCaptain && (
          <Box id="invitar" sx={{ display: "grid", gap: 3, scrollMarginTop: 96 }}>
            <Card>
              <SectionTitle>Invitá a tus compañeros</SectionTitle>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Mandales este link por WhatsApp. Si no tienen cuenta, la crean y entran al equipo.
              </Typography>
              {inviteLink ? (
                <>
                  <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: "var(--c-neutral-bg)", fontFamily: "ui-monospace, Menlo, monospace", fontSize: "0.85rem", overflowWrap: "anywhere", mb: 2 }}>
                    {inviteLink}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                    <CopyButton text={inviteLink} />
                    <Button variant="outlined" color="inherit" href={whatsapp!} target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</Button>
                    <form action={renewInviteLinkAction.bind(null, team.id)}>
                      <Button type="submit" size="small" color="inherit" sx={{ textDecoration: "underline" }}>Renovar link</Button>
                    </form>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                    Al renovarlo, el link anterior deja de funcionar.
                  </Typography>
                </>
              ) : (
                <form action={renewInviteLinkAction.bind(null, team.id)}>
                  <Button type="submit" variant="contained">Crear link de invitación</Button>
                </form>
              )}
            </Card>

            <Card>
              <SectionTitle>Sumar a alguien sin cuenta</SectionTitle>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Cargalo vos. Cuando se registre, usa su link y todo lo que jugó pasa a su perfil.
              </Typography>
              <GuestForm teamId={team.id} />
            </Card>
          </Box>
        )}
      </Box>
    </>
  );
}
