import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import A from "@/components/A";
import AttendanceButtons from "@/components/AttendanceButtons";
import Avatar from "@/components/Avatar";
import CopyButton from "@/components/CopyButton";
import Icon from "@/components/Icon";
import Crest from "@/lib/crests";
import { Bar, Card, SectionTitle, Tag } from "@/components/ui";
import { joinMatchAction, setAttendanceAction, setSideAction, shuffleSidesAction } from "@/app/actions/matches";
import GuestPhotoButton from "@/components/GuestPhotoButton";
import ShareImageButton from "@/components/ShareImageButton";
import MatchGuestForm from "./MatchGuestForm";
import FormationBoard from "@/components/FormationBoard";
import { toBoard } from "@/lib/formation";
import { latestStatuses, STATUS_OPTIONS } from "@/lib/state";
import { isOrganizer, sidesOf } from "@/lib/matchSides";
import { ATTENDANCE_LABEL, ATTENDANCE_TONE, dayLong, relativeDay, timeOf } from "@/lib/matches";
import { POSITIONS } from "@/lib/player";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatLabel } from "@/lib/teams";

export const metadata: Metadata = { title: "Partido" };

const ORDER = { CONFIRMED: 0, PENDING: 1, DECLINED: 2 } as const;

type Row = {
  id: string;
  playerId: string;
  attendance: "PENDING" | "CONFIRMED" | "DECLINED";
  side: "HOME" | "AWAY" | null;
  player: { firstName: string; lastName: string | null; position: string | null; userId: string | null; photoUrl: string | null; claimCode: string | null; createdById: string | null };
};

export default async function PartidoPage({ params }: PageProps<"/partidos/[id]">) {
  const [{ id }, user, h] = await Promise.all([params, requireUser(), headers()]);
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      homeTeam: true,
      awayTeam: true,
      players: { include: { player: true } },
      goals: { include: { scorer: true, assister: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!match) notFound();

  const mine = match.players.find((p) => p.player.userId === user.id);
  const organizer = await isOrganizer(match, user.id);
  // Un partido privado solo lo ven quienes participan
  if (match.visibility === "PRIVATE" && !mine && !organizer) notFound();

  const pickup = !match.homeTeamId;
  const { home, away } = sidesOf(match);
  const finished = match.status === "FINISHED" && match.homeScore != null && match.awayScore != null;
  const capacity = pickup ? match.playersPerSide * 2 : match.playersPerSide;
  const players = [...match.players].sort(
    (a, b) => ORDER[a.attendance] - ORDER[b.attendance] || a.player.firstName.localeCompare(b.player.firstName)
  );
  const confirmed = players.filter((p) => p.attendance === "CONFIRMED").length;
  const missing = Math.max(0, capacity - confirmed);
  const nameOf = (p: { firstName: string; lastName: string | null }) => [p.firstName, p.lastName].filter(Boolean).join(" ");
  const mvp = match.mvpId ? match.players.find((p) => p.playerId === match.mvpId)?.player : undefined;

  const withSide = match.players.filter((p) => p.attendance === "CONFIRMED" && p.side !== null);
  const board = toBoard(
    withSide.map((p) => ({ id: p.id, firstName: p.player.firstName, number: p.player.number, position: p.player.position, side: p.side, posX: p.posX, posY: p.posY })),
    pickup ? "split" : "full"
  );

  const proto = h.get("x-forwarded-proto") ?? "http";
  const link = `${proto}://${h.get("host") ?? "localhost:3000"}/p/${match.shareCode}`;
  const when = `${dayLong(match.playedAt)} · ${timeOf(match.playedAt)} hs`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(
    pickup
      ? `Picado ${when}${match.venue ? ` en ${match.venue}` : ""}. Faltan ${missing} para completar. Anotate: ${link}`
      : `${home.name} vs ${away.name}, ${when}${match.venue ? ` en ${match.venue}` : ""}. Confirmá si venís: ${link}`
  )}`;

  // Semáforo de cada jugador (solo "con molestias" o "descansando"), para que quien organiza lo tenga en cuenta
  const statuses = organizer && match.status !== "FINISHED" ? await latestStatuses(match.players.map((p) => p.playerId)) : new Map();

  const sideBtn = (label: string, playerId: string, side: "HOME" | "AWAY" | null, aria: string) => (
    <form action={setSideAction.bind(null, match.id, playerId, side)}>
      <Button type="submit" size="small" color="inherit" sx={{ textDecoration: "underline", minWidth: 0 }} aria-label={aria}>{label}</Button>
    </form>
  );

  const row = (p: Row, extra?: React.ReactNode) => {
    const full = nameOf(p.player);
    const pos = POSITIONS.find((x) => x.value === p.player.position)?.label;
    const self = p.player.userId === user.id;
    return (
      <Box component="li" key={p.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.1, flexWrap: "wrap", borderTop: "1px solid var(--c-border)", "&:first-of-type": { borderTop: 0 } }}>
        <Avatar name={full} size={38} playerId={p.playerId} />
        <Box sx={{ flex: 1, minWidth: 130 }}>
          <Box sx={{ fontWeight: 800 }}>{full}{self ? " (vos)" : ""}</Box>
          <Box sx={{ fontSize: "0.82rem", color: "text.secondary" }}>{pos ?? "Sin posición"}{p.player.userId == null ? " · sin cuenta" : ""}</Box>
        </Box>
        {(() => {
          const st = statuses.get(p.playerId);
          const o = st && st !== "READY" ? STATUS_OPTIONS.find((x) => x.value === st) : undefined;
          return o ? <Tag tone={o.tone}>{o.short}</Tag> : null;
        })()}
        {extra}
        {!finished && p.player.userId == null && p.player.createdById === user.id && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
            <GuestPhotoButton playerId={p.playerId} name={full} hasPhoto={!!p.player.photoUrl} />
            {p.player.claimCode && <CopyButton text={`${link.replace(/\/p\/[^/]+$/, "")}/reclamar/${p.player.claimCode}`} label="Link para reclamar" variant="outlined" size="small" />}
          </Box>
        )}
      </Box>
    );
  };

  const sideColumn = (side: "HOME" | "AWAY", name: string) => {
    const list = players.filter((p) => p.attendance === "CONFIRMED" && p.side === side);
    return (
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1 }}>
          <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.4rem", textTransform: "uppercase", overflowWrap: "anywhere" }}>{name}</Box>
          <Tag tone={list.length === match.playersPerSide ? "ok" : "neutral"}>{list.length}/{match.playersPerSide}</Tag>
        </Box>
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {list.length === 0 && <Box sx={{ color: "text.secondary", fontSize: "0.9rem", py: 1 }}>Todavía no hay nadie.</Box>}
          {list.map((p) =>
            row(p, organizer && !finished && (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {sideBtn(side === "HOME" ? `Pasar a ${away.name}` : `Pasar a ${home.name}`, p.playerId, side === "HOME" ? "AWAY" : "HOME", `Pasar a ${nameOf(p.player)} al otro equipo`)}
                {sideBtn("Sacar", p.playerId, null, `Sacar a ${nameOf(p.player)} del equipo`)}
              </Box>
            ))
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      <A href="/partidos" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, mb: 2.5, fontWeight: 700, textDecoration: "none" }}>
        <Box sx={{ transform: "rotate(180deg)", display: "grid" }}><Icon name="arrowRight" size={18} /></Box> Partidos
      </A>

      <Box sx={{ borderRadius: "20px", color: "#fff", background: "linear-gradient(150deg, var(--c-hero-from) 0%, var(--c-hero-to) 100%)", p: { xs: 2.5, md: 4 }, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
          <Tag tone="brand">{finished ? "Finalizado" : relativeDay(match.playedAt)}</Tag>
          <Tag tone="neutral">{formatLabel(match.playersPerSide)}</Tag>
          {pickup && <Tag tone="neutral">Picado abierto</Tag>}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)", alignItems: "center", gap: { xs: 1.5, md: 4 }, textAlign: "center" }}>
          {[home, away].map((t, i) => (
            i === 1 ? null : (
              <Box key="h" sx={{ display: "grid", justifyItems: "center", gap: 1, minWidth: 0 }}>
                <Box sx={{ p: 1.25, borderRadius: "18px", bgcolor: "var(--c-tint)" }}>
                  <Crest crest={{ preset: t.preset, url: t.url }} name={t.name} color={t.color} size={64} />
                </Box>
                <Typography variant="h4" sx={{ fontSize: { xs: "1.3rem", md: "2.1rem" }, overflowWrap: "anywhere" }}>{t.name}</Typography>
              </Box>
            )
          ))}
          <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: { xs: finished ? "3.4rem" : "2.6rem", md: finished ? "5.6rem" : "4.4rem" }, lineHeight: 0.9, color: "var(--c-accent)", whiteSpace: "nowrap" }}>{finished ? `${match.homeScore} - ${match.awayScore}` : "VS"}</Box>
          <Box sx={{ display: "grid", justifyItems: "center", gap: 1, minWidth: 0 }}>
            <Box sx={{ p: 1.25, borderRadius: "18px", bgcolor: "var(--c-tint)" }}>
              <Crest crest={{ preset: away.preset, url: away.url }} name={away.name} color={away.color} size={64} />
            </Box>
            <Typography variant="h4" sx={{ fontSize: { xs: "1.3rem", md: "2.1rem" }, overflowWrap: "anywhere" }}>{away.name}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: { xs: 1.5, md: 3 }, mt: 3, color: "var(--c-sidebar-muted)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><Icon name="calendar" size={17} /> {when}</Box>
          {match.venue && <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><Icon name="pin" size={17} /> {match.venue}</Box>}
        </Box>
      </Box>

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,3fr) minmax(0,2fr)" }, alignItems: "start" }}>
        <Box sx={{ display: "grid", gap: 3, minWidth: 0 }}>
          {finished && (
            <Card>
              <SectionTitle>Cómo fue</SectionTitle>
              {mvp && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, mb: 2, borderRadius: "12px", bgcolor: "var(--c-warn-bg)" }}>
                  <Avatar name={nameOf(mvp)} size={38} playerId={match.mvpId} />
                  <Box><Box sx={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--c-warn-text)", textTransform: "uppercase" }}>Figura</Box><Box sx={{ fontWeight: 800 }}>{nameOf(mvp)}</Box></Box>
                </Box>
              )}
              {match.goals.length === 0 ? (
                <Typography color="text.secondary">No se cargaron goles individuales.</Typography>
              ) : (
                <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1 }}>
                  {match.goals.map((g) => (
                    <Box component="li" key={g.id} sx={{ display: "flex", gap: 1, alignItems: "baseline", flexWrap: "wrap" }}>
                      <Box sx={{ fontWeight: 800 }}>Gol de {nameOf(g.scorer)}{pickup ? ` (${g.side === "HOME" ? home.name : away.name})` : ""}</Box>
                      {g.assister && <Box sx={{ color: "text.secondary", fontSize: "0.9rem" }}>asistencia de {nameOf(g.assister)}</Box>}
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          )}

          {pickup ? (
            <Card>
              <SectionTitle aside={<Tag tone={missing === 0 ? "ok" : "warn"}>{missing === 0 ? "Completo" : `Faltan ${missing}`}</Tag>}>Los equipos</SectionTitle>
              <Box sx={{ fontWeight: 700, mb: 1 }}>{confirmed} de {capacity} anotados</Box>
              <Box sx={{ mb: 2.5 }}><Bar value={confirmed} max={capacity} tone="navy" /></Box>

              {organizer && !finished && confirmed > 1 && (
                <Box sx={{ mb: 2.5 }}>
                  <form action={shuffleSidesAction.bind(null, match.id)}>
                    <Button type="submit" variant="contained">Sortear equipos</Button>
                  </form>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Reparte parejo y trata de separar arqueros y posiciones. Después podés mover a cada uno.</Typography>
                </Box>
              )}

              <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(2, minmax(0,1fr))" } }}>
                {sideColumn("HOME", home.name)}
                {sideColumn("AWAY", away.name)}
              </Box>

              {(() => {
                const free = players.filter((p) => p.attendance === "CONFIRMED" && p.side === null);
                if (free.length === 0) return null;
                return (
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ fontWeight: 800, mb: 0.5 }}>Anotados sin equipo</Box>
                    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
                      {free.map((p) =>
                        row(p, organizer && !finished && (
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {sideBtn(`A ${home.name}`, p.playerId, "HOME", `Poner a ${nameOf(p.player)} en ${home.name}`)}
                            {sideBtn(`A ${away.name}`, p.playerId, "AWAY", `Poner a ${nameOf(p.player)} en ${away.name}`)}
                          </Box>
                        ))
                      )}
                    </Box>
                  </Box>
                );
              })()}

              {players.some((p) => p.attendance !== "CONFIRMED") && (
                <Box sx={{ mt: 3, color: "text.secondary", fontSize: "0.9rem" }}>
                  No van: {players.filter((p) => p.attendance !== "CONFIRMED").map((p) => p.player.firstName).join(", ")}
                </Box>
              )}
            </Card>
          ) : (
            <Card>
              <SectionTitle aside={<Tag tone={missing === 0 ? "ok" : "warn"}>{missing === 0 ? "Completo" : `Faltan ${missing}`}</Tag>}>Convocatoria</SectionTitle>
              <Box sx={{ fontWeight: 700, mb: 1 }}>{confirmed} de {capacity} confirmados</Box>
              <Box sx={{ mb: 2.5 }}><Bar value={confirmed} max={capacity} tone="navy" /></Box>
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
                {players.map((p) => {
                  const self = p.player.userId === user.id;
                  const full = nameOf(p.player);
                  return row(p, (
                    <>
                      <Tag tone={ATTENDANCE_TONE[p.attendance]}>{ATTENDANCE_LABEL[p.attendance]}</Tag>
                      {organizer && !self && !finished && (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {p.attendance !== "CONFIRMED" && (
                            <form action={setAttendanceAction.bind(null, match.id, p.playerId, "CONFIRMED")}>
                              <Button type="submit" size="small" color="inherit" sx={{ textDecoration: "underline" }} aria-label={`Confirmar a ${full}`}>Confirmar</Button>
                            </form>
                          )}
                          {p.attendance !== "DECLINED" && (
                            <form action={setAttendanceAction.bind(null, match.id, p.playerId, "DECLINED")}>
                              <Button type="submit" size="small" color="inherit" sx={{ textDecoration: "underline" }} aria-label={`Marcar que ${full} no va`}>No va</Button>
                            </form>
                          )}
                        </Box>
                      )}
                    </>
                  ));
                })}
              </Box>
            </Card>
          )}

          {withSide.length > 0 && (
            <Card>
              <SectionTitle>Formación</SectionTitle>
              <FormationBoard home={board.home} away={board.away} label={`Formación de ${home.name}${pickup ? ` y ${away.name}` : ""}`} />
            </Card>
          )}
        </Box>

        <Box sx={{ display: "grid", gap: 3, minWidth: 0 }}>
          {!finished && mine && (
            <Card>
              <SectionTitle aside={<Tag tone={ATTENDANCE_TONE[mine.attendance]}>{ATTENDANCE_LABEL[mine.attendance]}</Tag>}>¿Vas?</SectionTitle>
              <AttendanceButtons matchId={match.id} playerId={mine.playerId} current={mine.attendance} />
            </Card>
          )}
          {finished && mine && mine.attendance === "CONFIRMED" && mine.side && (
            <Card sx={{ bgcolor: "var(--c-tint)", borderColor: "transparent" }}>
              <SectionTitle>Valorá a tus compañeros</SectionTitle>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Una nota del 1 al 10 y en qué se destacó cada uno. Es anónimo y es lo que arma «Así te ven tus compañeros».
              </Typography>
              <Button variant="contained" href={`/partidos/${match.id}/valorar`}>Valorar ahora</Button>
            </Card>
          )}
          {!finished && !mine && pickup && (
            <Card>
              <SectionTitle>Sumate al picado</SectionTitle>
              {missing > 0 ? (
                <form action={joinMatchAction.bind(null, match.id)}>
                  <Button type="submit" variant="contained" size="large">Anotarme</Button>
                </form>
              ) : (
                <Typography color="text.secondary">Ya está completo.</Typography>
              )}
            </Card>
          )}

          <Card>
            <SectionTitle>Compartir el partido</SectionTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {pickup ? "Cualquiera con el link puede anotarse con su cuenta." : "Cualquiera con el link puede ver el partido. Para confirmar, tiene que ingresar a su cuenta."}
            </Typography>
            <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: "var(--c-neutral-bg)", fontFamily: "ui-monospace, Menlo, monospace", fontSize: "0.85rem", overflowWrap: "anywhere", mb: 2 }}>{link}</Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <CopyButton text={link} />
              <Button variant="outlined" color="inherit" href={whatsapp} target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</Button>
              <ShareImageButton code={match.shareCode} title={`${home.name} vs ${away.name}`} label={finished ? "Compartir resultado" : "Compartir imagen"} />
            </Box>
          </Card>

          {match.notes && (
            <Card sx={{ bgcolor: "var(--c-warn-bg)", borderColor: "transparent" }}>
              <SectionTitle>Aviso</SectionTitle>
              <Typography sx={{ color: "var(--c-warn-text)" }}>{match.notes}</Typography>
            </Card>
          )}

          {organizer && !finished && (
            <Card>
              <SectionTitle>Sumar jugadores</SectionTitle>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                ¿Alguien no usa la app? Anotalo con su nombre y aparece en los equipos igual. Si después se registra, puede reclamar su lugar.
              </Typography>
              <MatchGuestForm matchId={match.id} pickup={pickup} homeName={home.name} awayName={away.name} />
            </Card>
          )}

          {organizer && (
            <Card>
              <SectionTitle>{finished ? "Resultado" : "Organizar"}</SectionTitle>
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                {!finished && <Button variant="outlined" color="inherit" href={`/partidos/${match.id}/formacion`}>Armar formación</Button>}
                <Button variant="contained" href={`/partidos/${match.id}/resultado`}>{finished ? "Corregir resultado" : "Cargar resultado"}</Button>
              </Box>
            </Card>
          )}
        </Box>
      </Box>
    </>
  );
}
