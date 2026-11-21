import type { FormationPlayer } from "@/lib/demo";


// Cancha horizontal con los dos equipos ubicados
export default function FormationBoard(props: { home: FormationPlayer[]; away: FormationPlayer[]; label: string; homeName?: string; awayName?: string }) {
  return (
    <>
      <div className="fb-h"><Board {...props} /></div>
      <div className="fb-v"><Board {...props} vertical /></div>
      <style>{`.fb-v{display:none}@media (max-width:700px){.fb-h{display:none}.fb-v{display:block}}`}</style>
    </>
  );
}

function Board({
  home,
  away,
  label,
  homeName,
  awayName,
  vertical = false,
}: {
  home: FormationPlayer[];
  away: FormationPlayer[];
  label: string;
  homeName?: string;
  awayName?: string;
  vertical?: boolean;
}) {
  const W = vertical ? 360 : 600;
  const H = vertical ? 600 : 360;
  // En vertical, los que quedan en el centro se reparten a los costados para no taparse
  const spread = (list: FormationPlayer[]) => {
    if (!vertical) return list;
    const sorted = [...list].sort((a, b) => a.x - b.x);
    let k = 0;
    return sorted.map((p) => (Math.abs(p.y - 0.5) < 0.12 ? { ...p, y: 0.5 + [-0.26, 0.26, 0][k++ % 3] } : p));
  };
  const homeL = spread(home);
  const awayL = spread(away);
  const pt = (p: FormationPlayer) => (vertical ? { x: 30 + p.y * (W - 60), y: 52 + p.x * (H - 104) } : { x: 36 + p.x * (W - 72), y: p.y * H });
  const line = { stroke: "rgba(255,255,255,.45)", strokeWidth: 2, fill: "none" } as const;
  const Dot = ({ p, fill, text, ring }: { p: FormationPlayer; fill: string; text: string; ring: string }) => {
    const { x: cx, y: cy } = pt(p),  id = `ph-${Math.round(cx)}-${Math.round(cy)}`;
    const ini = p.name.trim().charAt(0).toUpperCase();
    return (
      <g>
        <circle cx={cx} cy={cy} r="24" fill={p.gk ? "var(--c-brand)" : fill} stroke={ring} strokeWidth="4" />
        <text x={cx} y={cy + 7} textAnchor="middle" fontSize="20" fontWeight="900" fill={p.gk ? "var(--c-brand-text)" : text} style={{ fontFamily: "var(--font-display)" }}>{ini}</text>
        {p.pid && (
          <>
            <clipPath id={id}><circle cx={cx} cy={cy} r="21" /></clipPath>
            <image href={`/foto/${p.pid}${p.ver ? `?v=${p.ver}` : ""}`} x={cx - 21} y={cy - 21} width="42" height="42" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id})`} />
          </>
        )}
        {p.n > 0 && (
          <g>
            <circle cx={cx + 18} cy={cy - 18} r="9" fill="var(--c-sidebar)" stroke="#fff" strokeWidth="1.5" />
            <text x={cx + 18} y={cy - 14.5} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#fff">{p.n}</text>
          </g>
        )}
        <rect x={cx - 34} y={cy + 28} width="68" height="17" rx="8.5" fill="rgba(7,16,36,.62)" />
        <text x={cx} y={cy + 40.5} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff">{p.name.length > 9 ? p.name.slice(0, 8) + "…" : p.name}</text>
      </g>
    );
  };

  return (
    <div style={{ borderRadius: 14 }}>
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} style={{ display: "block", width: "100%", height: "auto", borderRadius: 14 }}>
      <title>{label}</title>
      <rect width={W} height={H} fill="var(--c-pitch)" />
      {[0, 2, 4, 6, 8].map((i) =>
        vertical ? <rect key={i} y={i * 60} width={W} height="60" fill="rgba(255,255,255,.04)" /> : <rect key={i} x={i * 60} width="60" height={H} fill="rgba(255,255,255,.04)" />
      )}
      <rect x="14" y="14" width={W - 28} height={H - 28} rx="8" {...line} />
      {vertical ? (
        <>
          <line x1="14" y1={H / 2} x2={W - 14} y2={H / 2} {...line} />
          <circle cx={W / 2} cy={H / 2} r="44" {...line} />
          <rect x="100" y="14" width="160" height="76" {...line} />
          <rect x="140" y="14" width="80" height="30" {...line} />
          <rect x="100" y={H - 90} width="160" height="76" {...line} />
          <rect x="140" y={H - 44} width="80" height="30" {...line} />
        </>
      ) : (
        <>
          <line x1={W / 2} y1="14" x2={W / 2} y2={H - 14} {...line} />
          <circle cx={W / 2} cy={H / 2} r="44" {...line} />
          <rect x="14" y="100" width="76" height="160" {...line} />
          <rect x="14" y="140" width="30" height="80" {...line} />
          <rect x={W - 90} y="100" width="76" height="160" {...line} />
          <rect x={W - 44} y="140" width="30" height="80" {...line} />
        </>
      )}
      {homeName && <text x="28" y="38" textAnchor="start" fontSize="13" fontWeight="900" fill="#fff" opacity=".85" style={{ fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{homeName}</text>}
      {awayName && <text x={W - 28} y={vertical ? H - 26 : 38} textAnchor="end" fontSize="13" fontWeight="900" fill="var(--c-accent)" style={{ fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{awayName}</text>}
      {homeL.map((p, i) => (
        <Dot key={`h${i}`} p={p} fill="#FFFFFF" text="var(--c-text)" ring="var(--c-sidebar)" />
      ))}
      {awayL.map((p, i) => (
        <Dot key={`a${i}`} p={p} fill="var(--c-accent)" text="var(--c-text)" ring="#fff" />
      ))}
    </svg>
    </div>
  );
}
