import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { CREST_PRESETS, crestDrawing } from "@/lib/crests";
import { dayLong, timeOf } from "@/lib/matches";
import { sidesOf, type SideInfo } from "@/lib/matchSides";
import { MARK_BALL, MARK_PLAYER, MARK_STREAKS, MARK_VIEWBOX } from "@/lib/markData";
import { prisma } from "@/lib/prisma";
import { formatLabel } from "@/lib/teams";

const W = 1200;
const H = 630;
const NAVY = "#0E1A3A";
const CELESTE = "#75AADB";
const YELLOW = "#FFCE1F";

// Las tipografías viajan con la app (licencia OFL); next.config las incluye en el despliegue
const font = async (name: string) => {
  const buf = await readFile(join(process.cwd(), "src/assets/fonts", name));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
};

// Escudo como imagen: subido, de la galería (SVG) o la inicial sobre el color del equipo
function crest(side: SideInfo, size: number) {
  if (side.url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={side.url} width={size} height={size} alt="" style={{ borderRadius: size * 0.2, objectFit: "cover" }} />;
  }
  const preset = CREST_PRESETS.find((p) => p.id === side.preset);
  if (preset) return crestDrawing(preset, size, "c");
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.22, background: side.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.5, fontFamily: "BS", border: `4px solid ${NAVY}` }}>
      {side.name.charAt(0).toUpperCase()}
    </div>
  );
}

// Imagen para compartir (WhatsApp, Instagram): el resultado, o la convocatoria si todavía no se jugó
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const match = await prisma.match.findUnique({
    where: { shareCode: code },
    include: {
      homeTeam: true,
      awayTeam: true,
      players: { select: { playerId: true, attendance: true, player: { select: { firstName: true } } } },
      goals: { include: { scorer: { select: { firstName: true } } } },
    },
  });
  if (!match || match.visibility === "PRIVATE") return new Response("No encontrado", { status: 404 });

  const [bs, hg] = await Promise.all([
    font("big-shoulders-latin-900-normal.woff"),
    font("hanken-grotesk-latin-700-normal.woff"),
  ]);

  const { home, away } = sidesOf(match);
  const pickup = !match.homeTeamId;
  const finished = match.status === "FINISHED" && match.homeScore != null && match.awayScore != null;
  const capacity = pickup ? match.playersPerSide * 2 : match.playersPerSide;
  const confirmed = match.players.filter((p) => p.attendance === "CONFIRMED").length;
  const missing = Math.max(0, capacity - confirmed);

  const counts = new Map<string, number>();
  for (const g of match.goals) counts.set(g.scorer.firstName, (counts.get(g.scorer.firstName) ?? 0) + 1);
  const scorers = [...counts.entries()].map(([n, c]) => (c > 1 ? `${n} (${c})` : n)).join(", ");
  const mvp = match.mvpId ? match.players.find((p) => p.playerId === match.mvpId)?.player.firstName : null;

  const [vx, vy, vw, vh] = MARK_VIEWBOX;
  const when = `${dayLong(match.playedAt)} · ${timeOf(match.playedAt)} hs`;
  const footer = finished
    ? [scorers && `Goles: ${scorers}`, mvp && `Figura: ${mvp}`].filter(Boolean).join("   ·   ")
    : missing > 0
      ? `Faltan ${missing} para completar. ¡Anotate con el link!`
      : "Equipo completo";

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "44px 56px", background: `linear-gradient(150deg, ${NAVY} 0%, #1B3A78 100%)`, color: "#fff", fontFamily: "HG" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} width={(46 * vw) / vh} height={46}>
              <path d={MARK_STREAKS} fill={CELESTE} />
              <path d={MARK_PLAYER} fill="#fff" />
              <path d={MARK_BALL} fill={YELLOW} fillRule="evenodd" />
            </svg>
            <div style={{ fontFamily: "BS", fontSize: 54, lineHeight: 1 }}>picado.</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {pickup && <div style={{ display: "flex", padding: "8px 18px", borderRadius: 999, background: "rgba(255,255,255,.14)", fontSize: 24 }}>Picado abierto</div>}
            <div style={{ display: "flex", padding: "8px 18px", borderRadius: 999, background: YELLOW, color: NAVY, fontSize: 24 }}>
              {finished ? "Finalizado" : formatLabel(match.playersPerSide)}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 330, gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 172, height: 172, borderRadius: 24, background: "#E2EEF9" }}>{crest(home, 120)}</div>
            <div style={{ fontFamily: "BS", fontSize: 50, lineHeight: 1, textTransform: "uppercase", textAlign: "center", display: "flex", justifyContent: "center", maxWidth: 330 }}>{home.name}</div>
          </div>
          <div style={{ display: "flex", fontFamily: "BS", fontSize: finished ? 180 : 130, lineHeight: 0.9, color: finished ? "#fff" : CELESTE }}>
            {finished ? `${match.homeScore} - ${match.awayScore}` : "VS"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 330, gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 172, height: 172, borderRadius: 24, background: "#E2EEF9" }}>{crest(away, 120)}</div>
            <div style={{ fontFamily: "BS", fontSize: 50, lineHeight: 1, textTransform: "uppercase", textAlign: "center", display: "flex", justifyContent: "center", maxWidth: 330 }}>{away.name}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", fontSize: 32, color: CELESTE }}>{when}{match.venue ? `  ·  ${match.venue}` : ""}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28 }}>
            <div style={{ display: "flex" }}>{footer}</div>
            <div style={{ display: "flex", fontFamily: "BS", fontSize: 30, color: YELLOW, textTransform: "uppercase" }}>Tu fútbol cuenta</div>
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "BS", data: bs, weight: 900, style: "normal" },
        { name: "HG", data: hg, weight: 700, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    }
  );
}
