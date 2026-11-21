import { useId } from "react";

// Escudos ficticios y originales (no son de clubes reales).
// Cada uno se arma combinando forma + diseño + emblema + dos colores.

type Shape = "shield" | "round" | "badge";
type Pattern = "solid" | "stripes" | "half" | "band" | "chevron" | "hoops";
type Emblem = "star" | "bolt" | "ball" | "crown" | "wave" | "mountain";

export type CrestPreset = {
  id: string;
  name: string;
  shape: Shape;
  pattern: Pattern;
  c1: string;
  c2: string;
  emblem: Emblem;
  ec: string;
};

const NAVY = "#0E1A3A";
const CELESTE = "#75AADB";
const YELLOW = "#FFCE1F";
const RED = "#E5372B";
const GREEN = "#1E8F4E";
const WHITE = "#FFFFFF";

export const CREST_PRESETS: CrestPreset[] = [
  { id: "rayo", name: "Rayo", shape: "shield", pattern: "solid", c1: NAVY, c2: NAVY, emblem: "bolt", ec: YELLOW },
  { id: "albo", name: "Albo", shape: "shield", pattern: "stripes", c1: CELESTE, c2: WHITE, emblem: "star", ec: NAVY },
  { id: "corona", name: "Corona", shape: "badge", pattern: "half", c1: RED, c2: NAVY, emblem: "crown", ec: WHITE },
  { id: "marea", name: "Marea", shape: "round", pattern: "hoops", c1: "#1B3A78", c2: CELESTE, emblem: "wave", ec: WHITE },
  { id: "monte", name: "Monte", shape: "badge", pattern: "band", c1: GREEN, c2: NAVY, emblem: "mountain", ec: WHITE },
  { id: "sol", name: "Sol", shape: "round", pattern: "solid", c1: YELLOW, c2: YELLOW, emblem: "ball", ec: NAVY },
  { id: "bandera", name: "Bandera", shape: "shield", pattern: "band", c1: WHITE, c2: CELESTE, emblem: "star", ec: NAVY },
  { id: "tormenta", name: "Tormenta", shape: "badge", pattern: "chevron", c1: NAVY, c2: CELESTE, emblem: "bolt", ec: WHITE },
  { id: "fuego", name: "Fuego", shape: "shield", pattern: "half", c1: RED, c2: YELLOW, emblem: "ball", ec: NAVY },
  { id: "selva", name: "Selva", shape: "round", pattern: "stripes", c1: GREEN, c2: "#0F5C32", emblem: "star", ec: YELLOW },
  { id: "rey", name: "Rey", shape: "shield", pattern: "chevron", c1: "#8C1D40", c2: YELLOW, emblem: "crown", ec: WHITE },
  { id: "cumbre", name: "Cumbre", shape: "round", pattern: "solid", c1: CELESTE, c2: CELESTE, emblem: "mountain", ec: NAVY },
  { id: "noche", name: "Noche", shape: "badge", pattern: "hoops", c1: "#111111", c2: "#2B2B2B", emblem: "star", ec: YELLOW },
  { id: "oceano", name: "Océano", shape: "shield", pattern: "solid", c1: "#1B3A78", c2: "#1B3A78", emblem: "wave", ec: YELLOW },
  { id: "violeta", name: "Violeta", shape: "badge", pattern: "stripes", c1: "#6B4FBB", c2: WHITE, emblem: "ball", ec: NAVY },
  { id: "naranja", name: "Naranja", shape: "round", pattern: "band", c1: "#F28C28", c2: NAVY, emblem: "bolt", ec: WHITE },
];

export const isCrestPreset = (id: unknown): id is string =>
  typeof id === "string" && CREST_PRESETS.some((p) => p.id === id);

const SHAPES: Record<Shape, string> = {
  shield: "M10 8 H90 V60 C90 92 68 108 50 114 C32 108 10 92 10 60 Z",
  badge: "M50 6 L90 20 V64 C90 90 70 106 50 114 C30 106 10 90 10 64 V20 Z",
  round: "M4 60 a46 46 0 1 0 92 0 a46 46 0 1 0 -92 0 Z",
};

function Pattern({ p }: { p: CrestPreset }) {
  switch (p.pattern) {
    case "stripes":
      return (
        <>
          <rect x="26" y="0" width="16" height="120" fill={p.c2} />
          <rect x="58" y="0" width="16" height="120" fill={p.c2} />
        </>
      );
    case "half":
      return <rect x="50" y="0" width="50" height="120" fill={p.c2} />;
    case "band":
      return <polygon points="0,34 100,74 100,94 0,54" fill={p.c2} />;
    case "chevron":
      return <polygon points="0,40 50,70 100,40 100,58 50,88 0,58" fill={p.c2} />;
    case "hoops":
      return (
        <>
          <rect x="0" y="34" width="100" height="16" fill={p.c2} />
          <rect x="0" y="70" width="100" height="16" fill={p.c2} />
        </>
      );
    default:
      return null;
  }
}

function EmblemShape({ p }: { p: CrestPreset }) {
  const halo = { stroke: NAVY, strokeWidth: 2.5, strokeLinejoin: "round" as const, paintOrder: "stroke" as const };
  switch (p.emblem) {
    case "star":
      return <polygon points="50,38 56.5,51.5 71,53.5 60.5,63.8 63,78 50,71.2 37,78 39.5,63.8 29,53.5 43.5,51.5" fill={p.ec} {...halo} />;
    case "bolt":
      return <polygon points="57,36 36,63 49,63 43,82 65,54 51,54" fill={p.ec} {...halo} />;
    case "ball":
      return (
        <>
          <circle cx="50" cy="59" r="15" fill={WHITE} stroke={NAVY} strokeWidth="2.5" />
          <polygon points="50,50 57,55 54.5,63 45.5,63 43,55" fill={NAVY} />
        </>
      );
    case "crown":
      return <polygon points="33,74 33,48 42,58 50,44 58,58 67,48 67,74" fill={p.ec} {...halo} />;
    case "wave":
      return <path d="M32 62 q4.5 -9 9 0 t9 0 t9 0 t9 0" fill="none" stroke={p.ec} strokeWidth="6" strokeLinecap="round" />;
    case "mountain":
      return <polygon points="32,76 46,50 53,62 59,52 70,76" fill={p.ec} {...halo} />;
  }
}

// El dibujo del escudo, sin hooks: sirve también para generar imágenes (sin React del cliente)
export function crestDrawing(preset: CrestPreset, size: number, clip: string) {
  const path = SHAPES[preset.shape];
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <clipPath id={clip}>
          <path d={path} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="100" height="120" fill={preset.c1} />
        {Pattern({ p: preset })}
      </g>
      <path d={path} fill="none" stroke={NAVY} strokeWidth="4" strokeLinejoin="round" />
      {EmblemShape({ p: preset })}
    </svg>
  );
}

export function CrestSvg({ preset, size = 64 }: { preset: CrestPreset; size?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return crestDrawing(preset, size, `crest-${uid}`);
}

export type CrestValue = { preset?: string | null; url?: string | null };

// Escudo del equipo: imagen subida, uno de la galería, o la inicial sobre el color de camiseta
export default function Crest({
  crest,
  name,
  color = NAVY,
  size = 64,
}: {
  crest: CrestValue;
  name: string;
  color?: string;
  size?: number;
}) {
  if (crest.url) {
    return (
      // Imagen subida por el usuario (data URL chica): no pasa por next/image
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={crest.url}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: "cover", borderRadius: size * 0.22, display: "block", flexShrink: 0, border: `2px solid ${NAVY}` }}
      />
    );
  }
  const preset = CREST_PRESETS.find((p) => p.id === crest.preset);
  if (preset) return <CrestSvg preset={preset} size={size} />;
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <path d={SHAPES.shield} fill={color} stroke={NAVY} strokeWidth="4" strokeLinejoin="round" />
      <text x="50" y="76" textAnchor="middle" fontSize="52" fontWeight="900" fill={color.toUpperCase() === "#FFFFFF" || color.toUpperCase() === YELLOW ? NAVY : WHITE} style={{ fontFamily: "var(--font-display)" }}>
        {name.trim().charAt(0).toUpperCase() || "?"}
      </text>
    </svg>
  );
}
