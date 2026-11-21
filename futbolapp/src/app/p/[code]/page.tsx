import type { Metadata } from "next";
import { headers } from "next/headers";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { auth } from "@/auth";
import ShareImageButton from "@/components/ShareImageButton";
import AttendanceButtons from "@/components/AttendanceButtons";
import InviteShell from "@/components/InviteShell";
import Logo from "@/components/Logo";
import { Tag } from "@/components/ui";
import Crest from "@/lib/crests";
import { ATTENDANCE_LABEL, ATTENDANCE_TONE, dayLong, relativeDay, timeOf } from "@/lib/matches";
import { joinMatchAction } from "@/app/actions/matches";
import { sidesOf } from "@/lib/matchSides";
import { prisma } from "@/lib/prisma";
import { formatLabel } from "@/lib/teams";

// Al pegar el link en WhatsApp se ve la tarjeta del partido
export async function generateMetadata({ params }: PageProps<"/p/[code]">): Promise<Metadata> {
  const { code } = await params;
  const match = await prisma.match.findUnique({
    where: { shareCode: code },
    select: { visibility: true, status: true, homeScore: true, awayScore: true, homeName: true, awayName: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } } },
  });
  if (!match || match.visibility === "PRIVATE") return { title: "Partido" };
  const home = match.homeTeam?.name ?? match.homeName ?? "Equipo A";
  const away = match.awayTeam?.name ?? match.awayName ?? "Rival";
  const title = match.status === "FINISHED" && match.homeScore != null ? `${home} ${match.homeScore} - ${match.awayScore} ${away}` : `${home} vs ${away}`;
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host") ?? "localhost:3000"}`;
  const image = `${origin}/p/${code}/imagen`;
  return { title, openGraph: { title, images: [{ url: image, width: 1200, height: 630 }] }, twitter: { card: "summary_large_image", title, images: [image] } };
}

export default async function PublicMatchPage({ params }: PageProps<"/p/[code]">) {
  const { code } = await params;
  const [session, match] = await Promise.all([
    auth(),
    prisma.match.findUnique({
      where: { shareCode: code },
      include: { homeTeam: true, awayTeam: true, players: { include: { player: true } } },
    }),
  ]);
  const userId = session?.user?.id;
  const mine = userId ? match?.players.find((p) => p.player.userId === userId) : undefined;

  // Un partido privado solo se muestra a quienes participan
  if (!match || (match.visibility === "PRIVATE" && !mine)) {
    return (
      <InviteShell>
        <Typography variant="h2" sx={{ fontSize: "2.6rem" }}>No encontramos este partido.</Typography>
        <Typography color="text.secondary">Revisá el link o pedile uno nuevo a quien lo organiza.</Typography>
        <Button variant="contained" href="/">Ir al inicio</Button>
      </InviteShell>
    );
  }

  const { home, away } = sidesOf(match);
  const pickup = !match.homeTeamId;
  const capacity = pickup ? match.playersPerSide * 2 : match.playersPerSide;
  const confirmed = match.players.filter((p) => p.attendance === "CONFIRMED");
  const next = encodeURIComponent(`/p/${code}`);
  // En una página pública solo mostramos nombre y la inicial del apellido
  const short = (p: { firstName: string; lastName: string | null }) =>
    p.lastName ? `${p.firstName} ${p.lastName.charAt(0)}.` : p.firstName;

  return (
    <Box sx={{ minHeight: "100dvh", px: 2.5, py: 3 }}>
      <Box sx={{ maxWidth: 720, mx: "auto", display: "grid", gap: 3 }}>
        <Logo href="/" />

        <Box sx={{ borderRadius: "22px", color: "#fff", background: "linear-gradient(150deg, var(--c-hero-from) 0%, var(--c-hero-to) 100%)", p: { xs: 2.75, md: 4 }, textAlign: "center", display: "grid", gap: 2, justifyItems: "center" }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tag tone="brand">{relativeDay(match.playedAt)}</Tag>
            <Tag tone="neutral">{formatLabel(match.playersPerSide)}</Tag>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)", alignItems: "center", gap: 2, width: "100%" }}>
            <Box sx={{ display: "grid", justifyItems: "center", gap: 1, minWidth: 0 }}>
              <Box sx={{ p: 1, borderRadius: "16px", bgcolor: "var(--c-tint)" }}>
                <Crest crest={{ preset: home.preset, url: home.url }} name={home.name} color={home.color} size={56} />
              </Box>
              <Typography variant="h4" sx={{ fontSize: "1.5rem", overflowWrap: "anywhere" }}>{home.name}</Typography>
            </Box>
            <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "2.4rem", color: "var(--c-accent)", whiteSpace: "nowrap" }}>{match.status === "FINISHED" && match.homeScore != null ? `${match.homeScore} - ${match.awayScore}` : "VS"}</Box>
            <Box sx={{ display: "grid", justifyItems: "center", gap: 1, minWidth: 0 }}>
              <Box sx={{ p: 1, borderRadius: "16px", bgcolor: "var(--c-tint)" }}>
                <Crest crest={{ preset: away.preset, url: away.url }} name={away.name} color={away.color} size={56} />
              </Box>
              <Typography variant="h4" sx={{ fontSize: "1.5rem", overflowWrap: "anywhere" }}>{away.name}</Typography>
            </Box>
          </Box>
          <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "2.4rem", lineHeight: 1 }}>{timeOf(match.playedAt)} HS</Box>
          <Box sx={{ color: "var(--c-sidebar-muted)" }}>{dayLong(match.playedAt)}{match.venue ? ` · ${match.venue}` : ""}</Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <ShareImageButton code={code} title={`${home.name} vs ${away.name}`} label={match.status === "FINISHED" ? "Compartir resultado" : "Compartir imagen"} />
        </Box>

        {match.notes && (
          <Box sx={{ p: 2, borderRadius: "14px", bgcolor: "var(--c-warn-bg)", color: "var(--c-warn-text)", fontWeight: 600 }}>{match.notes}</Box>
        )}

        <Box sx={{ borderRadius: "18px", bgcolor: "var(--c-card)", border: "1px solid var(--c-border)", p: { xs: 2.5, md: 3 }, display: "grid", gap: 2 }}>
          {mine ? (
            <>
              <Typography variant="h4" sx={{ fontSize: "1.8rem" }}>¿Vas a jugar?</Typography>
              <AttendanceButtons matchId={match.id} playerId={mine.playerId} current={mine.attendance} />
              <Box><Tag tone={ATTENDANCE_TONE[mine.attendance]}>Tu respuesta: {ATTENDANCE_LABEL[mine.attendance]}</Tag></Box>
            </>
          ) : userId && pickup ? (
            <>
              <Typography variant="h4" sx={{ fontSize: "1.8rem" }}>Sumate al picado</Typography>
              {confirmed.length < capacity && match.status === "SCHEDULED" ? (
                <form action={joinMatchAction.bind(null, match.id)}>
                  <Button type="submit" variant="contained" size="large">Anotarme</Button>
                </form>
              ) : (
                <Typography color="text.secondary">Ya está completo o terminó.</Typography>
              )}
            </>
          ) : userId ? (
            <Typography color="text.secondary">
              Todavía no estás en la convocatoria de este partido. Pedile al capitán que te sume al equipo.
            </Typography>
          ) : (
            <>
              <Typography variant="h4" sx={{ fontSize: "1.8rem" }}>{pickup ? "Sumate al picado" : "¿Vas a jugar?"}</Typography>
              <Typography color="text.secondary">{pickup ? "Ingresá a tu cuenta para anotarte." : "Ingresá a tu cuenta para confirmar tu lugar."}</Typography>
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Button variant="contained" size="large" href={`/login?next=${next}`}>Ingresar</Button>
                <Button variant="outlined" color="inherit" size="large" href={`/registro?next=${next}`}>Crear cuenta</Button>
              </Box>
            </>
          )}
        </Box>

        <Box sx={{ borderRadius: "18px", bgcolor: "var(--c-card)", border: "1px solid var(--c-border)", p: { xs: 2.5, md: 3 } }}>
          <Typography variant="h4" sx={{ fontSize: "1.8rem", mb: 1.5 }}>
            Confirmados · {confirmed.length}/{capacity}
          </Typography>
          {confirmed.length === 0 ? (
            <Typography color="text.secondary">Todavía no confirmó nadie.</Typography>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {confirmed.map((p) => <Tag key={p.id} tone="ok">{short(p.player)}</Tag>)}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
