// Gráfico de radar simple (SVG): una forma por serie, de 1 a 10
export default function RadarChart({
  labels,
  values,
  previous,
  label,
}: {
  labels: string[];
  values: number[];
  /** estado anterior, se dibuja más suave para ver cuánto cambió */
  previous?: number[];
  label: string;
}) {
  const S = 340;
  const c = S / 2;
  const R = 108;
  const n = labels.length;
  const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pt = (i: number, v: number) => [c + Math.cos(ang(i)) * (R * v) / 10, c + Math.sin(ang(i)) * (R * v) / 10] as const;
  const poly = (vs: number[]) => vs.map((v, i) => pt(i, v).map((x) => x.toFixed(1)).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${S} ${S}`} role="img" aria-label={label} style={{ width: "100%", maxWidth: 360, height: "auto", display: "block", margin: "0 auto" }}>
      <title>{label}</title>
      {[2, 4, 6, 8, 10].map((r) => (
        <polygon key={r} points={poly(Array(n).fill(r))} fill="none" stroke="var(--c-border)" strokeWidth="1.5" />
      ))}
      {labels.map((_, i) => {
        const [x, y] = pt(i, 10);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="var(--c-border)" strokeWidth="1.5" />;
      })}
      {previous && <polygon points={poly(previous)} fill="none" stroke="var(--c-muted)" strokeWidth="2" strokeDasharray="5 4" />}
      <polygon points={poly(values)} fill="color-mix(in srgb, var(--c-accent) 45%, transparent)" stroke="var(--c-sidebar)" strokeWidth="3" strokeLinejoin="round" />
      {values.map((v, i) => {
        const [x, y] = pt(i, v);
        return <circle key={i} cx={x} cy={y} r="5" fill="var(--c-brand)" stroke="var(--c-sidebar)" strokeWidth="2.5" />;
      })}
      {labels.map((l, i) => {
        const [x, y] = pt(i, 12.6);
        return (
          <text key={l} x={x} y={y + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--c-text)">
            {l} {values[i]}
          </text>
        );
      })}
    </svg>
  );
}
