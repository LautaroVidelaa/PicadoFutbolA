import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import A from "@/components/A";
import Avatar from "@/components/Avatar";
import MatchRow from "@/components/MatchRow";
import { Card, PageHead, Tag } from "@/components/ui";
import Crest from "@/lib/crests";
import { searchPickups, searchPlayers, searchTeams } from "@/lib/explore";
import { toMatchView } from "@/lib/matchView";
import { POSITIONS } from "@/lib/player";
import { FORMATS, formatLabel } from "@/lib/teams";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Explorar" };

const TABS = [
  { id: "partidos", label: "Partidos" },
  { id: "equipos", label: "Equipos" },
  { id: "jugadores", label: "Jugadores" },
] as const;

export default async function ExplorarPage({ searchParams }: PageProps<"/explorar">) {
  const [sp, user] = await Promise.all([searchParams, requireUser()]);
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const q = one(sp.q).trim().slice(0, 60);
  const f = one(sp.f);
  const pos = one(sp.pos);
  // Si se busca desde la barra de arriba, sin elegir pestaña, se buscan jugadores
  const tabParam = one(sp.tipo);
  const tab = TABS.find((t) => t.id === tabParam)?.id ?? (q ? "jugadores" : "partidos");

  const [pickups, teams, players] = await Promise.all([
    tab === "partidos" ? searchPickups(q, f) : [],
    tab === "equipos" ? searchTeams(q, f) : [],
    tab === "jugadores" ? searchPlayers(q, pos) : [],
  ]);

  return (
    <>
      <PageHead title="Explorá." lead="Encontrá un picado con lugar libre, equipos de tu zona y jugadores." />

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }} role="tablist">
        {TABS.map((t) => (
          <A
            key={t.id} href={`/explorar?tipo=${t.id}`} role="tab" aria-selected={tab === t.id}
            sx={{
              px: 2, py: 1, borderRadius: 999, fontWeight: 800, textDecoration: "none",
              color: tab === t.id ? "var(--c-sidebar-text)" : "var(--c-text)",
              bgcolor: tab === t.id ? "var(--c-sidebar)" : "var(--c-card)",
              border: "1.5px solid", borderColor: tab === t.id ? "var(--c-sidebar)" : "var(--c-border)",
            }}
          >
            {t.label}
          </A>
        ))}
      </Box>

      <Card sx={{ mb: 3 }}>
        <Box component="form" action="/explorar" method="get" sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-start" }}>
          <input type="hidden" name="tipo" value={tab} />
          <TextField
            name="q" defaultValue={q} size="small" sx={{ flex: "1 1 220px" }}
            label={tab === "partidos" ? "Cancha o barrio" : tab === "equipos" ? "Nombre o zona" : "Nombre"}
            slotProps={{ htmlInput: { maxLength: 60 } }}
          />
          {tab !== "jugadores" ? (
            <TextField select name="f" label="Formato" defaultValue={f} size="small" sx={{ minWidth: 150 }}>
              <MenuItem value="">Todos</MenuItem>
              {FORMATS.map((x) => <MenuItem key={x} value={String(x)}>{formatLabel(x)}</MenuItem>)}
            </TextField>
          ) : (
            <TextField select name="pos" label="Posición" defaultValue={pos} size="small" sx={{ minWidth: 170 }}>
              <MenuItem value="">Todas</MenuItem>
              {POSITIONS.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
            </TextField>
          )}
          <Button type="submit" variant="contained">Buscar</Button>
        </Box>
      </Card>

      {tab === "partidos" && (
        pickups.length === 0 ? (
          <Empty title="No hay picados con lugar." text="Probá con otro filtro, o armá uno vos y compartí el link." cta={{ href: "/partidos/nuevo?tipo=picado", label: "Armar un picado" }} />
        ) : (
          <Box sx={{ display: "grid", gap: 1.5 }}>
            {pickups.map((m) => (
              <Box key={m.id}>
                <MatchRow m={toMatchView(m)} />
                {m.players.some((p) => p.player.userId === user.id) && <Box sx={{ mt: 0.5 }}><Tag tone="ok">Ya estás anotado</Tag></Box>}
              </Box>
            ))}
          </Box>
        )
      )}

      {tab === "equipos" && (
        teams.length === 0 ? (
          <Empty title="No encontramos equipos." text="Solo aparecen los equipos con visibilidad pública." />
        ) : (
          <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "minmax(0,1fr)", md: "repeat(2, minmax(0,1fr))" } }}>
            {teams.map((t) => (
              <A key={t.id} href={`/equipos/${t.id}`} className="lift" sx={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 2, p: 2, borderRadius: "16px", bgcolor: "var(--c-card)", border: "1px solid var(--c-border)" }}>
                <Crest crest={{ preset: t.crestPreset, url: t.crestUrl }} name={t.name} color={t.color} size={52} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box sx={{ fontWeight: 800, fontSize: "1.1rem", overflowWrap: "anywhere" }}>{t.name}</Box>
                  <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 0.5 }}>
                    <Tag tone="neutral">{formatLabel(t.format)}</Tag>
                    {t.zone && <Tag tone="neutral">{t.zone}</Tag>}
                    <Tag tone="neutral">{t._count.members} jugadores</Tag>
                  </Box>
                </Box>
              </A>
            ))}
          </Box>
        )
      )}

      {tab === "jugadores" && (
        players.length === 0 ? (
          <Empty title="No encontramos jugadores." text="Probá con otro nombre o posición." />
        ) : (
          <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "minmax(0,1fr)", md: "repeat(2, minmax(0,1fr))", xl: "repeat(3, minmax(0,1fr))" } }}>
            {players.map((p) => {
              const name = [p.firstName, p.lastName].filter(Boolean).join(" ");
              const label = POSITIONS.find((x) => x.value === p.position)?.label;
              return (
                <Box key={p.id} className="lift" sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, borderRadius: "16px", bgcolor: "var(--c-card)", border: "1px solid var(--c-border)" }}>
                  <Avatar name={name} size={48} playerId={p.id} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>{name}{p.userId === user.id ? " (vos)" : ""}</Box>
                    <Box sx={{ color: "text.secondary", fontSize: "0.88rem" }}>{label ?? "Sin posición"}{p.number != null ? ` · #${p.number}` : ""}</Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )
      )}
    </>
  );
}

function Empty({ title, text, cta }: { title: string; text: string; cta?: { href: string; label: string } }) {
  return (
    <Card sx={{ textAlign: "center", py: { xs: 5, md: 7 }, display: "grid", justifyItems: "center", gap: 1.5 }}>
      <Typography variant="h3" sx={{ fontSize: "2rem" }}>{title}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: "44ch" }}>{text}</Typography>
      {cta && <Button variant="contained" href={cta.href}>{cta.label}</Button>}
    </Card>
  );
}
