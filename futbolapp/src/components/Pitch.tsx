export type PitchPlayer = {
  n: number;
  name: string;
  x: number;
  y: number;
  gk?: boolean;
};

// Formación de ejemplo (fútbol 5, 1-2-1): arriba el delantero, abajo el arquero
export const DEMO_FORMATION: PitchPlayer[] = [
  { n: 9, name: "Lautaro", x: 150, y: 100 },
  { n: 8, name: "Nico", x: 88, y: 185 },
  { n: 10, name: "Mati", x: 212, y: 185 },
  { n: 4, name: "Fede", x: 150, y: 270 },
  { n: 1, name: "Juan", x: 150, y: 345, gk: true },
];

const CHALK = "#EAF0FF";

// Pizarra táctica: la cancha vista de arriba con los jugadores ubicados
export default function Pitch({
  players = DEMO_FORMATION,
  label = "Formación 1-2-1",
}: {
  players?: PitchPlayer[];
  label?: string;
}) {
  const line = { stroke: "rgba(234,240,255,.5)", strokeWidth: 2, fill: "none" } as const;

  return (
    <svg
      viewBox="0 0 300 400"
      role="img"
      aria-label={label}
      style={{ display: "block", width: "100%", height: "auto", borderRadius: 14 }}
    >
      <title>{label}</title>
      <rect width="300" height="400" fill="#13275A" />
      {[0, 2, 4, 6].map((i) => (
        <rect key={i} y={i * 50} width="300" height="50" fill="rgba(255,255,255,.035)" />
      ))}
      <rect x="14" y="14" width="272" height="372" rx="8" {...line} />
      <line x1="14" y1="200" x2="286" y2="200" {...line} />
      <circle cx="150" cy="200" r="36" {...line} />
      <circle cx="150" cy="200" r="3" fill="rgba(234,240,255,.5)" />
      <rect x="84" y="14" width="132" height="58" {...line} />
      <rect x="116" y="14" width="68" height="24" {...line} />
      <rect x="84" y="328" width="132" height="58" {...line} />
      <rect x="116" y="362" width="68" height="24" {...line} />

      {players.map((p) => (
        <g key={p.n}>
          <circle
            cx={p.x}
            cy={p.y}
            r="20"
            fill={p.gk ? "#FFCE1F" : CHALK}
            stroke="#0E1A3A"
            strokeWidth="2.5"
          />
          <text
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#0E1A3A"
            style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 24 }}
          >
            {p.n}
          </text>
          <text
            x={p.x}
            y={p.y + 36}
            textAnchor="middle"
            fill={CHALK}
            style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}
          >
            {p.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
