import { MARK_BALL, MARK_PLAYER, MARK_STREAKS, MARK_VIEWBOX } from "@/lib/markData";

// Isotipo: la silueta del jugador pateando, con la pelota y las líneas de velocidad.
// Los colores se pasan por props para usarlo sobre cualquier fondo.
export default function Mark({
  height = 32,
  player = "currentColor",
  ball = "var(--c-brand)",
  streaks = "var(--c-accent)",
  title,
}: {
  height?: number;
  player?: string;
  ball?: string;
  streaks?: string;
  title?: string;
}) {
  const [x, y, w, h] = MARK_VIEWBOX;
  return (
    <svg
      viewBox={`${x} ${y} ${w} ${h}`}
      height={height}
      width={(height * w) / h}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ display: "block", flexShrink: 0 }}
    >
      <path d={MARK_STREAKS} style={{ fill: streaks }} />
      <path d={MARK_PLAYER} style={{ fill: player }} />
      <path d={MARK_BALL} fillRule="evenodd" style={{ fill: ball }} />
    </svg>
  );
}
