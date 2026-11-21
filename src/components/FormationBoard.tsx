import type { FormationPlayer } from "@/lib/demo";

const W = 600;
const H = 360;

// Cancha horizontal con los dos equipos ubicados
export default function FormationBoard({
  home,
  away,
  label,
}: {
  home: FormationPlayer[];
  away: FormationPlayer[];
  label: string;
}) {
  const line = { stroke: "rgba(255,255,255,.45)", strokeWidth: 2, fill: "none" } as const;
  const Dot = ({ p, fill, text }: { p: FormationPlayer; fill: string; text: string }) => (
    <g>
      <circle cx={p.x * W} cy={p.y * H} r="19" fill={p.gk ? "var(--c-brand)" : fill} stroke="var(--c-sidebar)" strokeWidth="2.5" />
      <text x={p.x * W} y={p.y * H + 5.5} textAnchor="middle" fontSize="16" fontWeight="800" fill={p.gk ? "var(--c-brand-text)" : text} style={{ fontFamily: "var(--font-display)" }}>
        {p.n}
      </text>
      <text x={p.x * W} y={p.y * H + 36} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#fff">
        {p.name}
      </text>
    </g>
  );

  return (
    <div style={{ overflowX: "auto", borderRadius: 14 }}>
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} style={{ display: "block", width: "100%", minWidth: 520, height: "auto", borderRadius: 14 }}>
      <title>{label}</title>
      <rect width={W} height={H} fill="var(--c-pitch)" />
      {[0, 2, 4, 6, 8].map((i) => (
        <rect key={i} x={i * 60} width="60" height={H} fill="rgba(255,255,255,.04)" />
      ))}
      <rect x="14" y="14" width={W - 28} height={H - 28} rx="8" {...line} />
      <line x1={W / 2} y1="14" x2={W / 2} y2={H - 14} {...line} />
      <circle cx={W / 2} cy={H / 2} r="44" {...line} />
      <rect x="14" y="100" width="76" height="160" {...line} />
      <rect x="14" y="140" width="30" height="80" {...line} />
      <rect x={W - 90} y="100" width="76" height="160" {...line} />
      <rect x={W - 44} y="140" width="30" height="80" {...line} />
      {home.map((p, i) => (
        <Dot key={`h${i}`} p={p} fill="#FFFFFF" text="var(--c-text)" />
      ))}
      {away.map((p, i) => (
        <Dot key={`a${i}`} p={p} fill="var(--c-accent)" text="var(--c-text)" />
      ))}
    </svg>
    </div>
  );
}
