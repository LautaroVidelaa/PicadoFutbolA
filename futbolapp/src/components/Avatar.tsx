import Box from "@mui/material/Box";

// Foto del jugador. Mientras no haya fotos, se muestran las iniciales.
export default function Avatar({
  name,
  size = 48,
  square = false,
  playerId,
  photoSrc,
  ver,
}: {
  name: string;
  size?: number;
  square?: boolean;
  /** si el jugador tiene foto, se muestra encima de las iniciales */
  playerId?: string | null;
  /** vista previa de una foto que todavía no se guardó */
  photoSrc?: string;
  /** cambia cuando cambia la foto (ver photoVer) */
  ver?: number;
}) {
  const src = photoSrc ?? (playerId ? `/foto/${playerId}${ver ? `?v=${ver}` : ""}` : undefined);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        borderRadius: square ? "18px" : "50%",
        bgcolor: "var(--c-accent)",
        color: "var(--c-text)",
        fontFamily: "var(--font-display)",
        fontWeight: 900,
        fontSize: size * 0.4,
        lineHeight: 1,
        letterSpacing: "0.02em",
        position: "relative",
        overflow: "hidden",
        backgroundImage:
          "linear-gradient(135deg, color-mix(in srgb, var(--c-accent) 70%, #fff) 0%, var(--c-accent) 60%)",
      }}
    >
      {initials || "?"}
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" key={src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
    </Box>
  );
}
