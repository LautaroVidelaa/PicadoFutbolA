import NextLink from "next/link";
import Mark from "@/components/Mark";
import { BRAND } from "@/lib/brand";

// Logo: isotipo + nombre. tone="dark" es para usarlo sobre fondos oscuros.
export default function Logo({
  href = "/",
  tone = "light",
  size = 1,
}: {
  href?: string;
  tone?: "light" | "dark";
  size?: number;
}) {
  const onDark = tone === "dark";
  return (
    <NextLink
      href={href}
      aria-label={`${BRAND.name}, ir al inicio`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10 * size,
        color: onDark ? "#fff" : "var(--c-text)",
        textDecoration: "none",
      }}
    >
      <Mark
        height={30 * size}
        player={onDark ? "#FFFFFF" : "var(--c-text)"}
        ball="var(--c-brand)"
        streaks="var(--c-accent)"
      />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: `${1.9 * size}rem`,
          lineHeight: 1,
          letterSpacing: "0.01em",
        }}
      >
        {BRAND.name}
      </span>
    </NextLink>
  );
}
