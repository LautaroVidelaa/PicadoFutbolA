import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import A from "@/components/A";
import Avatar from "@/components/Avatar";
import Icon from "@/components/Icon";
import NightPitch from "@/components/NightPitch";
import MatchRow from "@/components/MatchRow";
import { Bar, Card, PageHead, SectionTitle, StatTile, Tag } from "@/components/ui";
import { loadCareer } from "@/lib/career";
import { dayShort, relativeDay, timeOf } from "@/lib/matches";
import { toMatchView } from "@/lib/matchView";
import { nextMatchFor } from "@/lib/nextMatch";
import { loadOnboarding, loadTodos } from "@/lib/todo";
import { POSITIONS } from "@/lib/player";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Inicio" };

export default async function InicioPage() {
  const user = await requireUser();
  const [nextDb, todos, steps] = await Promise.all([
    nextMatchFor(user.id),
    loadTodos(user.playerId),
    loadOnboarding(user.playerId, { position: user.position, number: user.number }),
  ]);
  const doneSteps = steps.filter((x) => x.done).length;
  const next = nextDb ? toMatchView(nextDb) : null;
  const CAREER = await loadCareer(user.playerId ?? "");
  const history = CAREER.matches.slice(0, 3);
  const pos = POSITIONS.find((p) => p.value === user.position)?.label;
  const maxPj = Math.max(1, ...CAREER.byTeam.map((t) => t.pj));
  const logro = CAREER.achievements.filter((a) => a.done).pop();
  const perGame = (n: number) => (CAREER.pj ? n / CAREER.pj : 0);

  return (
    <>
      <PageHead
        title={`Buenas, ${user.firstName}.`}
        lead="Tu próximo partido también es parte de tu historia."
        action={
          <Button variant="contained" size="large" href="/partidos/nuevo" startIcon={<Icon name="plus" size={20} />}>
            Organizar partido
          </Button>
        }
      />

      {todos.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <SectionTitle aside={<Tag tone="brand">{todos.length} {todos.length === 1 ? "pendiente" : "pendientes"}</Tag>}>Tu turno</SectionTitle>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1 }}>
            {todos.map((t) => (
              <Box component="li" key={t.id} className="lift" sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", p: 1.5, borderRadius: "12px", bgcolor: t.tone === "warn" ? "var(--c-warn-bg)" : "var(--c-tint)" }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Box sx={{ fontWeight: 800 }}>{t.title}</Box>
                  <Box sx={{ fontSize: "0.88rem", color: "text.secondary", overflowWrap: "anywhere" }}>{t.text}</Box>
                </Box>
                <Button variant="contained" size="small" href={t.href}>{t.cta}</Button>
              </Box>
            ))}
          </Box>
        </Card>
      )}

      {steps.length > 0 && doneSteps < steps.length && (
        <Card sx={{ mb: 3 }}>
          <SectionTitle aside={<Tag tone="neutral">{doneSteps} de {steps.length}</Tag>}>Primeros pasos</SectionTitle>
          <Box sx={{ mb: 2 }}><Bar value={doneSteps} max={steps.length} tone="navy" /></Box>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 0.5 }}>
            {steps.map((st) => (
              <Box component="li" key={st.id}>
                <A href={st.href} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1, borderRadius: "10px", textDecoration: "none", color: "inherit", opacity: st.done ? 0.6 : 1, "&:hover": { bgcolor: "var(--c-neutral-bg)" } }}>
                  <Box aria-hidden="true" sx={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", border: "2px solid var(--c-text)", bgcolor: st.done ? "var(--c-brand)" : "transparent" }}>
                    {st.done && <Icon name="check" size={16} />}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ fontWeight: 700, textDecoration: st.done ? "line-through" : "none" }}>{st.label}</Box>
                    {!st.done && <Box sx={{ fontSize: "0.85rem", color: "text.secondary" }}>{st.hint}</Box>}
                  </Box>
                  <Box sx={{ ml: "auto", display: st.done ? "none" : "block" }}><Icon name="arrowRight" size={18} /></Box>
                </A>
              </Box>
            ))}
          </Box>
        </Card>
      )}

      {/* Banner del próximo partido + resumen de carrera */}
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,2fr) minmax(0,1fr)" }, mb: 3 }}>
        <Box sx={{ position: "relative", overflow: "hidden", borderRadius: "20px", color: "#fff", minHeight: { xs: 300, md: 280 }, display: "flex", alignItems: "flex-end", p: { xs: 2.75, md: 4 } }}>
          <NightPitch />
          <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(10,17,40,.88) 0%, rgba(10,17,40,.55) 55%, rgba(10,17,40,.1) 100%)" }} />
          <Box sx={{ position: "relative", maxWidth: 520 }}>
            <Box sx={{ mb: 1.5 }}><Tag tone="brand">Tu fútbol cuenta</Tag></Box>
            <Typography variant="h2" sx={{ fontSize: "clamp(2.2rem, 5.5vw, 3.4rem)", mb: 1.5 }}>
              El próximo capítulo se juega en la cancha.
            </Typography>
            <Box sx={{ color: "var(--c-sidebar-muted)", mb: 2.5, maxWidth: { md: 420 } }}>
              {next
                ? `${dayShort(next.playedAt)} · ${timeOf(next.playedAt)} hs${next.venue ? ` · ${next.venue}` : ""} · ${next.confirmed}/${next.needed} confirmados`
                : "Todavía no tenés partidos programados."}
            </Box>
            <Button variant="contained" href={next ? `/partidos/${next.id}` : "/partidos/nuevo"} endIcon={<Icon name="arrowUpRight" size={18} />}>
              {next ? "Ver próximo partido" : "Organizar un partido"}
            </Button>
          </Box>
        </Box>

        <Card sx={{ bgcolor: "var(--c-tint)", borderColor: "transparent", display: "grid", alignContent: "space-between", gap: 2.5 }}>
          <Box sx={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--c-tint-text)" }}>Tu carrera</Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar name={user.fullName} size={64} square playerId={user.playerId} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h4" sx={{ fontSize: "1.9rem", overflowWrap: "anywhere" }}>{user.fullName}</Typography>
              <Box sx={{ color: "text.secondary", fontSize: "0.9rem" }}>{pos ?? "Sin posición todavía"}</Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2.5 }}>
            <Box>
              <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "4.4rem", lineHeight: 0.85 }}>{CAREER.rating ?? "-"}</Box>
              <Box sx={{ fontSize: "0.78rem", fontWeight: 700, color: "text.secondary" }}>Rating</Box>
            </Box>
            <Box sx={{ pb: 0.25 }}>
              <Box sx={{ fontWeight: 800, color: "var(--c-tint-text)" }}>
                {CAREER.rating == null ? "Todavía sin partidos" : `${CAREER.ratingDelta >= 0 ? "+" : ""}${CAREER.ratingDelta} en los últimos partidos`}
              </Box>
              <Box sx={{ fontSize: "0.85rem", color: "text.secondary" }}>Tu nivel crece con cada partido.</Box>
            </Box>
          </Box>
        </Card>
      </Box>

      <Box sx={{ display: "grid", gap: { xs: 1.5, md: 3 }, gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" }, mb: 3 }}>
        <StatTile label="Partidos jugados" value={CAREER.pj} sub={`${CAREER.wins} V · ${CAREER.draws} E · ${CAREER.losses} D`} />
        <StatTile label="Goles" value={CAREER.goals} sub={`${perGame(CAREER.goals).toFixed(2).replace(".", ",")} por partido`} />
        <StatTile label="Asistencias" value={CAREER.assists} sub="El pase también cuenta" />
        <StatTile label="Figura del partido" value={CAREER.mvp} sub="Veces que te eligieron" />
      </Box>

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,3fr) minmax(0,2fr)" }, alignItems: "start" }}>
        <Box sx={{ display: "grid", gap: 3, minWidth: 0 }}>
          <Card sx={{ display: next ? { xs: "none", md: "block" } : "block" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h3" sx={{ fontSize: "1.7rem" }}>Volvés a la cancha</Typography>
              {next && (
                <Tag tone={next.confirmed >= next.needed ? "ok" : "warn"}>
                  {next.confirmed >= next.needed ? "Completo" : "Falta gente"}
                </Tag>
              )}
            </Box>
            {next ? (
              <>
                <Box sx={{ display: "flex", gap: { xs: 2, sm: 3 }, alignItems: "center", flexWrap: "wrap", pb: 2, mb: 2, borderBottom: "1px solid var(--c-border)" }}>
                  <Box>
                    <Box sx={{ fontSize: "0.78rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>{relativeDay(next.playedAt)}</Box>
                    <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "3rem", lineHeight: 0.95 }}>{timeOf(next.playedAt)}</Box>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ fontWeight: 800, fontSize: "1.15rem", overflowWrap: "anywhere" }}>{next.home.name} vs. {next.away.name}</Box>
                    <Box sx={{ color: "text.secondary", fontSize: "0.9rem" }}>Fútbol {next.format}{next.venue ? ` · ${next.venue}` : ""}</Box>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                    <Box sx={{ fontWeight: 600 }}>{next.confirmed} de {next.needed} confirmados</Box>
                    {next.needed > next.confirmed && <Tag tone="warn">Faltan {next.needed - next.confirmed} jugadores</Tag>}
                  </Box>
                  <Button variant="contained" href={`/partidos/${next.id}`} endIcon={<Icon name="arrowRight" size={18} />}>
                    Ver convocatoria
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                <Typography color="text.secondary">Armá el próximo partido y mandá el link al grupo.</Typography>
                <Button variant="contained" href="/partidos/nuevo">Organizar partido</Button>
              </Box>
            )}
          </Card>

          <Card>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1 }}>
              <Typography variant="h3" sx={{ fontSize: "1.7rem" }}>Lo último que jugaste</Typography>
              <A href="/partidos?tab=historial" sx={{ fontWeight: 700, fontSize: "0.92rem", whiteSpace: "nowrap" }}>Ver historial →</A>
            </Box>
            <Box sx={{ display: "grid", gap: 1.25 }}>
              {history.length === 0 && <Typography color="text.secondary">Todavía no hay partidos con resultado.</Typography>}
              {history.map((m) => (
                <MatchRow key={m.id} m={m} />
              ))}
            </Box>
          </Card>
        </Box>

        <Card sx={{ minWidth: 0 }}>
          <Box sx={{ fontSize: "0.82rem", fontWeight: 700, color: "text.secondary", mb: 1 }}>Tu carrera no tiene camiseta</Box>
          <Typography variant="h3" sx={{ fontSize: "2.1rem", mb: 1 }}>
            {CAREER.byTeam.length > 1 ? `${CAREER.byTeam.length} equipos. Una sola historia.` : "Una sola historia."}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Todo lo que jugás, en un mismo perfil.
          </Typography>
          <Box sx={{ display: "grid", gap: 2, pb: 2.5, mb: 2.5, borderBottom: "1px solid var(--c-border)" }}>
            {CAREER.byTeam.length === 0 && <Typography variant="body2" color="text.secondary">Cuando se cargue tu primer resultado, vas a ver acá en qué equipos jugaste.</Typography>}
            {CAREER.byTeam.map((t, i) => (
              <Box key={t.name}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75, fontWeight: 700, fontSize: "0.92rem", gap: 1 }}>
                  <span>{t.name}</span>
                  <Box component="span" sx={{ color: "text.secondary", fontWeight: 600, whiteSpace: "nowrap" }}>{t.pj} PJ</Box>
                </Box>
                <Bar value={t.pj} max={maxPj} tone={i === 0 ? "navy" : i === 1 ? "accent" : "brand"} />
              </Box>
            ))}
          </Box>
          {logro && (
            <>
              <Tag tone="brand">Último logro</Tag>
              <Box sx={{ mt: 1.25, display: "flex", alignItems: "baseline", gap: 1.5, flexWrap: "wrap" }}>
                <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.6rem", textTransform: "uppercase" }}>{logro.title}</Box>
                <Box sx={{ color: "text.secondary", fontSize: "0.88rem" }}>{logro.text}</Box>
              </Box>
            </>
          )}
        </Card>
      </Box>
    </>
  );
}
