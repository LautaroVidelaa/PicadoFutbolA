import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import A from "@/components/A";
import Icon from "@/components/Icon";
import MatchRow from "@/components/MatchRow";
import ProfileHeader from "@/components/ProfileHeader";
import RatingChart from "@/components/RatingChart";
import { Bar, Card, PageHead, SectionTitle, StatTile, Tag } from "@/components/ui";
import { chartScale, loadCareer } from "@/lib/career";
import { prisma } from "@/lib/prisma";
import { ATTRS, STATUS_OPTIONS } from "@/lib/state";
import { requireUser } from "@/lib/session";
import StateForm from "./StateForm";

export const metadata: Metadata = { title: "Mi carrera" };

const TABS = [
  ["resumen", "Resumen"],
  ["historial", "Historial"],
  ["estadisticas", "Estadísticas"],
  ["logros", "Logros"],
  ["valoraciones", "Valoraciones"],
  ["estado", "Mi estado"],
] as const;
type Tab = (typeof TABS)[number][0];

const fmt = (n: number) => String(n).replace(".", ",");

export default async function CarreraPage({ searchParams }: PageProps<"/carrera">) {
  const [{ tab: raw }, user] = await Promise.all([searchParams, requireUser()]);
  const tab: Tab = TABS.some(([k]) => k === raw) ? (raw as Tab) : "resumen";
  const CAREER = await loadCareer(user.playerId ?? "");
  const states = tab === "estado" && user.playerId ? await prisma.stateEntry.findMany({ where: { playerId: user.playerId }, orderBy: { createdAt: "desc" }, take: 8 }) : [];
  const dateFmt = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "numeric", month: "short" });
  const perGame = (n: number) => (CAREER.pj ? fmt(Number((n / CAREER.pj).toFixed(2))) : "0");

  return (
    <>
      <PageHead
        title="Mi carrera"
        lead="Todo lo que jugaste. Todo lo que sos en la cancha."
        action={
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button variant="outlined" color="inherit" href="/rankings" startIcon={<Icon name="trophy" size={18} />}>
              Rankings
            </Button>
            <Button variant="contained" href="/perfil">Editar perfil</Button>
          </Box>
        }
      />

      <ProfileHeader
        name={user.fullName}
        playerId={user.playerId}
        position={user.position}
        number={user.number}
        since={user.since}
        rating={CAREER.rating}
        ratingDelta={CAREER.ratingDelta}
        value={CAREER.value}
      />

      <Box sx={{ display: "grid", gap: { xs: 1.5, md: 3 }, gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" }, my: 3 }}>
        <StatTile label="Partidos" value={CAREER.pj} sub={`${CAREER.wins} V · ${CAREER.draws} E · ${CAREER.losses} D`} />
        <StatTile label="Goles" value={CAREER.goals} sub={`${perGame(CAREER.goals)} por partido`} />
        <StatTile label="Asistencias" value={CAREER.assists} sub={`${perGame(CAREER.assists)} por partido`} />
        <StatTile label="Figura del partido" value={CAREER.mvp} sub="Veces que te eligieron" />
      </Box>

      <Box role="tablist" aria-label="Secciones de tu carrera" sx={{ display: "flex", gap: { xs: 2.5, md: 4 }, overflowX: "auto", borderBottom: "1px solid var(--c-border)", mb: 3 }}>
        {TABS.map(([k, label]) => {
          const on = k === tab;
          return (
            <A key={k} href={`/carrera?tab=${k}`} role="tab" aria-selected={on} sx={{ py: 1.5, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", color: on ? "text.primary" : "text.secondary", borderBottom: "3px solid", borderColor: on ? "var(--c-brand)" : "transparent", mb: "-1px" }}>
              {label}
            </A>
          );
        })}
      </Box>

      {tab === "resumen" && (CAREER.pj === 0 ? (
        <Card sx={{ textAlign: "center", py: { xs: 5, md: 7 }, display: "grid", justifyItems: "center", gap: 1.5 }}>
          <Typography variant="h3" sx={{ fontSize: "2rem" }}>Tu carrera empieza con el primer partido.</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: "48ch" }}>
            Cuando se cargue el resultado de un partido en el que jugaste, acá vas a ver tus goles, tu evolución y tus logros.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center" }}>
            <Button variant="contained" href="/partidos/nuevo">Organizar un partido</Button>
            <Button variant="outlined" color="inherit" href="/explorar">Buscar un picado</Button>
          </Box>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,3fr) minmax(0,2fr)" }, alignItems: "start" }}>
          <Box sx={{ display: "grid", gap: 3, minWidth: 0 }}>
            <Card>
              <SectionTitle aside={<Tag tone="ok">{CAREER.series[CAREER.series.length - 1] - CAREER.series[0] >= 0 ? "+" : ""}{CAREER.series[CAREER.series.length - 1] - CAREER.series[0]} desde el primer partido</Tag>}>Tu evolución</SectionTitle>
              <RatingChart data={CAREER.series} {...chartScale(CAREER.series)} />
            </Card>
            <Card>
              <SectionTitle>{CAREER.byTeam.length === 1 ? "Tu camiseta" : `Una carrera, ${CAREER.byTeam.length} camisetas`}</SectionTitle>
              <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(3, minmax(0,1fr))" } }}>
                {CAREER.byTeam.map((t) => (
                  <Box key={t.name}>
                    <Box sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>{t.name}</Box>
                    <Box sx={{ color: "text.secondary", fontSize: "0.88rem" }}>
                      {t.pj} PJ · {t.goals} G · {t.assists} A
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>
          <Box sx={{ display: "grid", gap: 3, minWidth: 0 }}>
            <Card>
              <SectionTitle>Tu forma</SectionTitle>
              <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                {CAREER.form.map((o, i) => (
                  <Box key={i} aria-label={o === "G" ? "Victoria" : o === "E" ? "Empate" : "Derrota"} sx={{ width: 40, height: 40, borderRadius: "10px", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.3rem", bgcolor: o === "G" ? "var(--c-sidebar)" : o === "E" ? "var(--c-accent)" : "var(--c-warn-bg)", color: o === "G" ? "#fff" : o === "E" ? "var(--c-text)" : "var(--c-warn-text)" }}>{o}</Box>
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary">Tus últimos {CAREER.form.length} partidos, del más nuevo al más viejo.</Typography>
            </Card>
            <Card>
              <SectionTitle>Así te ven tus compañeros</SectionTitle>
              {CAREER.peer.avg == null ? (
                <Typography variant="body2" color="text.secondary">
                  {CAREER.peer.total === 0 ? "Todavía no te valoraron." : `Tenés ${CAREER.peer.total} valoración${CAREER.peer.total === 1 ? "" : "es"}.`} El promedio aparece desde las 3 valoraciones, para que sea anónimo.
                </Typography>
              ) : (
                <>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mb: 0.5 }}>
                    <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "3.4rem", lineHeight: 0.95 }}>{fmt(CAREER.peer.avg)}</Box>
                    <Box sx={{ color: "text.secondary" }}>/ 10 · {CAREER.peer.total} valoraciones</Box>
                  </Box>
                  <Box sx={{ fontSize: "0.88rem", color: "text.secondary" }}>
                    {CAREER.peer.traits.slice(0, 2).map((t) => t.label).join(" y ")}{CAREER.peer.traits.length ? ": lo que más destacan." : ""}
                  </Box>
                </>
              )}
            </Card>
            <Card sx={{ bgcolor: "var(--c-tint)", borderColor: "transparent" }}>
              <SectionTitle>Pequeñas grandes conquistas</SectionTitle>
              <Box sx={{ display: "grid", gap: 1.5 }}>
                {CAREER.achievements.filter((a) => a.done).slice(-3).reverse().map((a, i) => (
                  <Box key={a.title} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Box sx={{ width: 30, height: 30, borderRadius: "8px", display: "grid", placeItems: "center", bgcolor: "var(--c-brand)", color: "var(--c-brand-text)", fontFamily: "var(--font-display)", fontWeight: 900 }}>{i + 1}</Box>
                    <Box>
                      <Box sx={{ fontWeight: 800 }}>{a.title}</Box>
                      <Box sx={{ fontSize: "0.82rem", color: "text.secondary" }}>{a.text}</Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>
        </Box>
      ))}

      {tab === "historial" && (
        <Box sx={{ display: "grid", gap: 1.25 }}>
          {CAREER.matches.length === 0 && <Typography color="text.secondary">Todavía no jugaste partidos con resultado.</Typography>}
          {CAREER.matches.map((m) => <MatchRow key={m.id} m={m} />)}
        </Box>
      )}

      {tab === "estadisticas" && (
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0,1fr)", md: "repeat(2, minmax(0,1fr))" } }}>
          <Card>
            <SectionTitle>Resultados</SectionTitle>
            <Box sx={{ display: "grid", gap: 2 }}>
              {([["Victorias", CAREER.wins, "navy"], ["Empates", CAREER.draws, "accent"], ["Derrotas", CAREER.losses, "brand"]] as const).map(([l, v, tone]) => (
                <Box key={l}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: 700, mb: 0.75 }}><span>{l}</span><span>{v}</span></Box>
                  <Bar value={v} max={Math.max(1, CAREER.pj)} tone={tone} />
                </Box>
              ))}
            </Box>
          </Card>
          <Card>
            <SectionTitle>Por equipo</SectionTitle>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", "& th, & td": { textAlign: "left", py: 1.1, borderBottom: "1px solid var(--c-border)" }, "& th": { fontSize: "0.8rem", color: "text.secondary", fontWeight: 700 }, "& td:not(:first-of-type), & th:not(:first-of-type)": { textAlign: "right" } }}>
              <thead><tr><th>Equipo</th><th>PJ</th><th>G</th><th>A</th></tr></thead>
              <tbody>
                {CAREER.byTeam.map((t) => (
                  <tr key={t.name}><td style={{ fontWeight: 700 }}>{t.name}</td><td>{t.pj}</td><td>{t.goals}</td><td>{t.assists}</td></tr>
                ))}
              </tbody>
            </Box>
          </Card>
        </Box>
      )}

      {tab === "logros" && (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(2, minmax(0,1fr))", lg: "repeat(3, minmax(0,1fr))" } }}>
          {CAREER.achievements.map((a) => (
            <Card key={a.title} sx={{ display: "flex", gap: 1.5, alignItems: "center", opacity: a.done ? 1 : 0.65, bgcolor: a.done ? "var(--c-tint)" : "var(--c-card)" }}>
              <Box sx={{ width: 44, height: 44, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0, bgcolor: a.done ? "var(--c-brand)" : "transparent", border: a.done ? 0 : "2px dashed var(--c-muted)", color: a.done ? "var(--c-brand-text)" : "var(--c-muted)" }}>
                <Icon name={a.done ? "star" : "trophy"} size={22} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800 }}>{a.title}</Typography>
                <Typography variant="body2" color="text.secondary">{a.text}</Typography>
              </Box>
            </Card>
          ))}
        </Box>
      )}


      {tab === "valoraciones" && (
        <Card sx={{ maxWidth: 640 }}>
          <SectionTitle aside={CAREER.peer.avg != null ? <Tag tone="navy">{fmt(CAREER.peer.avg)} / 10</Tag> : undefined}>Lo que dicen tus compañeros</SectionTitle>
          {CAREER.peer.avg == null ? (
            <Typography color="text.secondary">
              {CAREER.peer.total === 0 ? "Todavía no te valoraron." : `Tenés ${CAREER.peer.total} valoración${CAREER.peer.total === 1 ? "" : "es"}.`} Después de cada partido, tus compañeros te ponen una nota y marcan en qué te destacás. Los resultados se muestran desde las 3 valoraciones, así nadie sabe quién puso qué.
            </Typography>
          ) : (
            <>
              <Box sx={{ display: "grid", gap: 2 }}>
                {CAREER.peer.traits.map((t) => (
                  <Box key={t.id}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: 700, mb: 0.75 }}><span>{t.label}</span><span>{t.value}%</span></Box>
                    <Bar value={t.value} max={100} tone="navy" />
                  </Box>
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5 }}>
                Porcentaje de valoraciones que te destacaron en cada cosa, sobre {CAREER.peer.total}.
              </Typography>
            </>
          )}
        </Card>
      )}

      {tab === "estado" && (
        <Box sx={{ display: "grid", gap: 3 }}>
          <Card>
            <SectionTitle aside={states[0] ? <Tag tone={STATUS_OPTIONS.find((o) => o.value === states[0].status)?.tone ?? "neutral"}>{STATUS_OPTIONS.find((o) => o.value === states[0].status)?.label}</Tag> : undefined}>Mi estado</SectionTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: "62ch" }}>
              Cómo te ves hoy, de 1 a 10. Lo cargás vos, a tu criterio, y sirve para ver cómo evolucionás. Si hay uno anterior, aparece punteado en el gráfico.
            </Typography>
            <StateForm
              key={states[0]?.id ?? "nuevo"}
              initial={{
                speed: states[0]?.speed ?? 5, stamina: states[0]?.stamina ?? 5, power: states[0]?.power ?? 5,
                technique: states[0]?.technique ?? 5, defense: states[0]?.defense ?? 5,
                status: states[0]?.status ?? "READY", note: states[0]?.note ?? "",
              }}
              previous={states[1] ? ATTRS.map((a) => states[1][a.id]) : undefined}
            />
          </Card>
          {states.length > 1 && (
            <Card>
              <SectionTitle>Tu evolución</SectionTitle>
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1 }}>
                {states.map((e) => (
                  <Box component="li" key={e.id} sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "baseline", py: 0.75, borderTop: "1px solid var(--c-border)", "&:first-of-type": { borderTop: 0 } }}>
                    <Box sx={{ fontWeight: 800, minWidth: 64 }}>{dateFmt.format(e.createdAt)}</Box>
                    <Box sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                      {ATTRS.map((a) => `${a.label.slice(0, 3)} ${e[a.id]}`).join(" · ")}
                    </Box>
                    <Tag tone={STATUS_OPTIONS.find((o) => o.value === e.status)?.tone ?? "neutral"}>{STATUS_OPTIONS.find((o) => o.value === e.status)?.short}</Tag>
                  </Box>
                ))}
              </Box>
            </Card>
          )}
        </Box>
      )}
    </>
  );
}
