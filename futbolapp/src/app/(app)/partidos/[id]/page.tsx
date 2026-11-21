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
import SidesForm from "./SidesForm";
import MatchGuestForm from "./MatchGuestForm";
import FormationBoard from "@/components/FormationBoard";
import { toBoard } from "@/lib/formation";
import { latestStatuses, STATUS_OPTIONS } from "@/lib/state";
import { isOrganizer, sidesOf } from "@/lib/matchSides";
import { ATTENDANCE_LABEL, ATTENDANCE_TONE, dayLong, relativeDay, timeOf } from "@/lib/matches";
import { POSITIONS, photoVer } from "@/lib/player";
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
    withSide.map((p) => ({ id: p.id, firstName: p.player.firstName, number: p.player.number, position: p.player.position, side: p.side, posX: p.posX, posY: p.posY, playerId: p.playerId, photoVer: photoVer(p.player.photoUrl) })),
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

  const pill = { font: "inherit", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", px: 1.5, py: 0.55, borderRadius: 999, border: "1.5px solid var(--c-text)", bgcolor: "transparent", color: "var(--c-text)", whiteSpace: "nowrap" } as const;
  const sideBtn = (label: string, playerId: string, side: "HOME" | "AWAY" | null, aria: string) => (
    <form action={setSideAction.bind(null, match.id, playerId, side)}>
      <Box
        component="button" type="submit" aria-label={aria}
        sx={{
          ...pill,
          ...(side === "HOME" ? { bgcolor: "var(--c-sidebar)", color: "#fff", borderColor: "var(--c-sidebar)" } : side === "AWAY" ? { bgcolor: "var(--c-accent)", borderColor: "var(--c-accent)" } : { border: 0, textDecoration: "underline", color: "var(--c-muted)", px: 0.5 }),
          "&:hover": { filter: "brightness(1.08)", transform: "translateY(-1px)" },
        }}
      >
        {label}
      </Box>
    </form>
  );

  const row = (p: Row, extra?: React.ReactNode) => {
    const full = nameOf(p.player);
    const pos = POSITIONS.find((x) => x.value === p.player.position)?.label;
    const self = p.player.userId === user.id;
    const st = statuses.get(p.playerId);
    const so = st && st !== "READY" ? STATUS_OPTIONS.find((x) => x.value === st) : undefined;
    const own = !finished && p.player.userId == null && p.player.createdById === user.id;
    return (
      <Box component="li" key={p.id} sx={{ display: "grid", gap: 1, p: 1.25, borderRadius: "14px", bgcolor: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "0 1px 0 rgba(14,26,58,.04)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ position: "relative", flexShrink: 0 }}>
            <Box sx={{ p: "3px", borderRadius: "50%", border: "3px solid", borderColor: p.side === "HOME" ? "var(--c-sidebar)" : p.side === "AWAY" ? "var(--c-accent)" : "var(--c-border)" }}>
              <Avatar name={full} size={52} playerId={p.playerId} ver={photoVer(p.player.photoUrl)} />
            </Box>
            {p.player.position && (
              <Box component="span" sx={{ position: "absolute", right: -6, bottom: -4, px: 0.6, borderRadius: 999, fontSize: "0.62rem", fontWeight: 900, lineHeight: 1.5, bgcolor: "var(--c-sidebar)", color: "#fff", border: "2px solid var(--c-card)" }}>{p.player.position}</Box>
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>{full}{self ? " (vos)" : ""}</Box>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", alignItems: "center", mt: 0.25 }}>
              <Box sx={{ fontSize: "0.8rem", color: "text.secondary" }}>{pos ?? "Sin posición"}</Box>
              {p.player.userId == null && <Tag tone="warn">Sin cuenta</Tag>}
              {so && <Tag tone={so.tone}>{so.short}</Tag>}
            </Box>
          </Box>
        </Box>
        {(extra || own) && (
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", alignItems: "center", pt: 1, borderTop: "1px dashed var(--c-border)" }}>
            {extra}
            {own && (
              <>
                <GuestPhotoButton playerId={p.playerId} name={full} hasPhoto={!!p.player.photoUrl} />
                {p.player.claimCode && <CopyButton text={`${link.replace(/\/p\/[^/]+$/, "")}/reclamar/${p.player.claimCode}`} label="Link para reclamar" variant="outlined" size="small" />}
              </>
            )}
          </Box>
        )}
      </Box>
    );
  };

  const sideColumn = (side: "HOME" | "AWAY", info: typeof home) => {
    const list = players.filter((p) => p.attendance === "CONFIRMED" && p.side === side);
    const free = Math.max(0, match.playersPerSide - list.length);
    const other = side === "HOME" ? away : home;
    return (
      <Box sx={{ minWidth: 0, borderRadius: "18px", bgcolor: "var(--c-neutral-bg)", p: 1.5, borderTop: "6px solid", borderTopColor: side === "HOME" ? "var(--c-sidebar)" : "var(--c-accent)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}>
          <Crest crest={{ preset: info.preset, url: info.url }} name={info.name} color={info.color} size={40} />
          <Box sx={{ flex: 1, minWidth: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.5rem", lineHeight: 1, textTransform: "uppercase", overflowWrap: "anywhere" }}>{info.name}</Box>
          <Tag tone={free === 0 ? "ok" : "neutral"}>{list.length}/{match.playersPerSide}</Tag>
        </Box>
        <Box aria-hidden="true" sx={{ display: "flex", gap: 0.6, mb: 1.5 }}>
          {Array.from({ length: match.playersPerSide }, (_, i) => (
            <Box key={i} sx={{ flex: 1, height: 6, borderRadius: 999, bgcolor: i < list.length ? "var(--c-sidebar)" : "var(--c-border)" }} />
          ))}
        </Box>
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1 }}>
          {list.map((p) =>
            row(p, organizer && !finished && (
              <>
                {sideBtn(`Pasar a ${other.name}`, p.playerId, side === "HOME" ? "AWAY" : "HOME", `Pasar a ${nameOf(p.player)} al otro equipo`)}
                {sideBtn("Sacar", p.playerId, null, `Sacar a ${nameOf(p.player)} del equipo`)}
              </>
            ))
          )}
          {Array.from({ length: free }, (_, i) => (
            <Box component="li" key={`free${i}`} sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 64, borderRadius: "14px", border: "2px dashed var(--c-border)", color: "text.secondary", fontWeight: 700, fontSize: "0.9rem" }}>
              Lugar libre
            </Box>
          ))}
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

              {withSide.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ fontWeight: 800, mb: 1 }}>Así van quedando</Box>
                  <FormationBoard home={board.home} away={board.away} homeName={home.name} awayName={away.name} label={`Formación de ${home.name} y ${away.name}`} />
                  {organizer && !finished && (
                    <Box sx={{ mt: 1.25 }}>
                      <Button href={`/partidos/${match.id}/formacion`} variant="outlined" color="inherit" size="small">Acomodar en la cancha</Button>
                    </Box>
                  )}
                </Box>
              )}

              <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(2, minmax(0,1fr))" } }}>
                {sideColumn("HOME", home)}
                {sideColumn("AWAY", away)}
              </Box>

              {(() => {
                const free = players.filter((p) => p.attendance === "CONFIRMED" && p.side === null);
                if (free.length === 0) return null;
                return (
                  <Box sx={{ mt: 3, p: 1.5, borderRadius: "18px", border: "2px dashed var(--c-border)" }}>
                    <Box sx={{ fontWeight: 800, mb: 0.25 }}>Anotados sin equipo · {free.length}</Box>
                    <Box sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 1.5 }}>{organizer ? "Elegí a qué equipo va cada uno, o sorteá los equipos." : "Quien organiza los reparte."}</Box>
                    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1, gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(2, minmax(0,1fr))" } }}>
                      {free.map((p) =>
                        row(p, organizer && !finished && (
                          <>
                            {sideBtn(`A ${home.name}`, p.playerId, "HOME", `Poner a ${nameOf(p.player)} en ${home.name}`)}
                            {sideBtn(`A ${away.name}`, p.playerId, "AWAY", `Poner a ${nameOf(p.player)} en ${away.name}`)}
                          </>
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

          {!pickup && withSide.length > 0 && (
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

          {organizer && !finished && (!match.homeTeamId || !match.awayTeamId) && (
            <Card>
              <Box component="details" sx={{ "& > summary": { cursor: "pointer", listStyle: "none", "&::-webkit-details-marker": { display: "none" } } }}>
                <Box component="summary">
                  <SectionTitle aside={<Tag tone="neutral">Tocá para editar</Tag>}>{pickup ? "Nombre y escudo de los equipos" : "Escudo del rival"}</SectionTitle>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Dales identidad: un nombre y un escudo de la galería o una imagen propia. Se ve en el partido y en la imagen para compartir.
                </Typography>
                <SidesForm
                  matchId={match.id}
                  home={match.homeTeamId ? null : { name: home.name, preset: home.preset, url: home.url }}
                  away={match.awayTeamId ? null : { name: away.name, preset: away.preset, url: away.url }}
                />
              </Box>
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
