// Línea de evolución del rating (SVG simple, sin librerías)
export default function RatingChart({
  data,
  min = 55,
  max = 85,
  ticks = [60, 70, 80],
  startLabel = "Primer partido",
  endLabel = "Último",
}: {
  data: number[];
  min?: number;
  max?: number;
  ticks?: number[];
  startLabel?: string;
  endLabel?: string;
}) {
  const W = 600;
  const H = 220;
  const pad = { l: 34, r: 14, t: 16, b: 26 };
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / (data.length - 1);
  const y = (v: number) => pad.t + ((max - v) * (H - pad.t - pad.b)) / (max - min);
  const line = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)} ${H - pad.b} L${x(0)} ${H - pad.b} Z`;
  const last = data.length - 1;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Evolución del rating: de ${data[0]} a ${data[last]} en ${data.length} partidos`}
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="var(--c-border)" strokeWidth="1" />
          <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" fontSize="12" fill="var(--c-muted)">
            {v}
          </text>
        </g>
      ))}
      <path d={area} fill="var(--c-accent)" opacity="0.22" />
      <path d={line} fill="none" stroke="var(--c-text)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={i === last ? 6 : 3.5} fill={i === last ? "var(--c-brand)" : "var(--c-text)"} stroke="var(--c-text)" strokeWidth={i === last ? 2.5 : 0} />
      ))}
      <text x={x(last)} y={y(data[last]) - 14} textAnchor="end" fontSize="15" fontWeight="800" fill="var(--c-text)">
        {data[last]}
      </text>
      <text x={x(0)} y={H - 6} fontSize="12" fill="var(--c-muted)" textAnchor="start">
        {startLabel}
      </text>
      <text x={x(last)} y={H - 6} fontSize="12" fill="var(--c-muted)" textAnchor="end">
        {endLabel}
      </text>
    </svg>
  );
}
