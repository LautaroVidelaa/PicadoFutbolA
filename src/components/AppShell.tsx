"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Avatar from "@/components/Avatar";
import Logo from "@/components/Logo";
import Icon, { type IconName } from "@/components/Icon";
import { BRAND } from "@/lib/brand";
import { logoutAction } from "@/app/actions/auth";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/inicio", label: "Inicio", icon: "home" },
  { href: "/partidos", label: "Partidos", icon: "ball" },
  { href: "/equipos", label: "Equipos", icon: "users" },
  { href: "/carrera", label: "Mi carrera", icon: "user" },
  { href: "/explorar", label: "Explorar", icon: "search" },
  { href: "/rankings", label: "Rankings", icon: "trophy" },
];

const CRUMBS: Record<string, string> = {
  "/inicio": "Inicio",
  "/partidos": "Partidos",
  "/equipos": "Equipos",
  "/carrera": "Mi carrera",
  "/explorar": "Explorar",
  "/rankings": "Rankings",
  "/perfil": "Configuración",
};

export default function AppShell({
  name,
  role,
  playerId,
  unread = 0,
  children,
}: {
  playerId: string | null;
  unread?: number;
  name: string;
  role: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const section = "/" + (pathname.split("/")[1] ?? "");
  const crumb = CRUMBS[section] ?? "";
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "256px minmax(0,1fr)" } }}>
      {/* Barra lateral (escritorio) */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100dvh",
          p: 2.5,
          gap: 3,
          bgcolor: "var(--c-sidebar)",
          color: "var(--c-sidebar-text)",
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--c-sidebar-stripe) 0 40px, transparent 40px 80px)",
        }}
      >
        <Box sx={{ px: 1, pt: 0.5 }}>
          <Logo href="/inicio" tone="dark" />
          <Box sx={{ mt: 0.75, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--c-sidebar-muted)" }}>
            {BRAND.tagline}
          </Box>
        </Box>
        <Box component="nav" aria-label="Principal" sx={{ display: "grid", gap: 0.5 }}>
          {NAV.map((n) => {
            const on = active(n.href);
            return (
              <Box
                key={n.href}
                component={NextLink}
                href={n.href}
                aria-current={on ? "page" : undefined}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.75,
                  py: 1.25,
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: 700,
                  color: on ? "var(--c-sidebar-active-text)" : "var(--c-sidebar-muted)",
                  bgcolor: on ? "var(--c-sidebar-active)" : "transparent",
                  transition: "background-color 140ms, color 140ms",
                  "&:hover": on ? {} : { bgcolor: "rgba(255,255,255,.08)", color: "#fff" },
                }}
              >
                <Icon name={n.icon} />
                {n.label}
              </Box>
            );
          })}
        </Box>

        <Box sx={{ mt: "auto", display: "grid", gap: 1.5 }}>
          <Box sx={{ p: 2, borderRadius: "14px", bgcolor: "var(--c-sidebar-promo)" }}>
            <Box sx={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.6rem", lineHeight: 0.98, textTransform: "uppercase", mb: 0.75, color: "var(--c-sidebar-active)" }}>
              No es solo un partido.
            </Box>
            <Box sx={{ fontSize: "0.86rem", color: "var(--c-sidebar-muted)" }}>
              Cada picado suma a tu historia.
            </Box>
          </Box>
          <Box
            component={NextLink}
            href="/perfil"
            aria-current={section === "/perfil" ? "page" : undefined}
            sx={{
              display: "flex", alignItems: "center", gap: 1.5, px: 1.75, py: 1.1, borderRadius: "12px", textDecoration: "none", fontWeight: 700,
              color: section === "/perfil" ? "var(--c-sidebar-active-text)" : "var(--c-sidebar-muted)",
              bgcolor: section === "/perfil" ? "var(--c-sidebar-active)" : "transparent",
              "&:hover": section === "/perfil" ? {} : { bgcolor: "rgba(255,255,255,.08)", color: "#fff" },
            }}
          >
            <Icon name="sliders" /> Configuración
          </Box>
          <Box sx={{ px: 1.75, fontSize: "0.72rem", color: "var(--c-sidebar-muted)" }}>
            Versión de prueba
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, borderTop: "1px solid rgba(255,255,255,.12)", pt: 1.5 }}>
            <Box
              component={NextLink}
              href="/perfil"
              aria-label="Mi perfil"
              sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: 1, minWidth: 0, p: 0.5, borderRadius: "12px", textDecoration: "none", color: "inherit", "&:hover": { bgcolor: "rgba(255,255,255,.08)" } }}
            >
              <Avatar name={name} size={38} playerId={playerId} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</Box>
                <Box sx={{ fontSize: "0.76rem", color: "var(--c-sidebar-muted)" }}>{role}</Box>
              </Box>
            </Box>
            <form action={logoutAction}>
              <Box
                component="button"
                type="submit"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                sx={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: "10px", border: 0, cursor: "pointer", bgcolor: "transparent", color: "var(--c-sidebar-muted)", "&:hover": { bgcolor: "rgba(255,255,255,.1)", color: "#fff" } }}
              >
                <Icon name="logout" />
              </Box>
            </form>
          </Box>
        </Box>
      </Box>

      <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Barra superior */}
        <Box
          component="header"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: { xs: 2.5, md: 5 },
            py: { xs: 1.5, md: 2 },
            borderBottom: "1px solid var(--c-border)",
            bgcolor: "color-mix(in srgb, var(--c-page) 88%, transparent)",
            backdropFilter: "blur(8px)",
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          <Box sx={{ display: { md: "none" } }}>
            <Logo href="/inicio" size={0.85} />
          </Box>
          <Box aria-label="Dónde estás" sx={{ display: { xs: "none", md: "block" }, fontSize: "0.9rem", color: "text.secondary", whiteSpace: "nowrap" }}>
            Mi espacio / <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>{crumb}</Box>
          </Box>
          <Box
            component="form" action="/explorar" method="get" role="search"
            sx={{
              display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1, flex: 1, maxWidth: 420, mx: "auto", px: 1.75, height: 42,
              borderRadius: "12px", border: "1px solid var(--c-border)", bgcolor: "var(--c-card)", color: "var(--c-muted)",
            }}
          >
            <Icon name="search" size={18} />
            <Box component="input" name="q" maxLength={60} placeholder="Buscar jugadores…" aria-label="Buscar jugadores"
              sx={{ flex: 1, border: 0, outline: 0, bgcolor: "transparent", font: "inherit", fontSize: "0.92rem", color: "inherit", minWidth: 0, "&::placeholder": { color: "var(--c-muted)", opacity: 0.85 } }} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              component={NextLink} href="/notificaciones"
              aria-label={unread > 0 ? `Notificaciones: ${unread} sin leer` : "Notificaciones"}
              sx={{ position: "relative", display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--c-border)", bgcolor: "var(--c-card)", color: "var(--c-text)", textDecoration: "none" }}
            >
              <Icon name="bell" size={20} />
              {unread > 0 && (
                <Box component="span" sx={{ position: "absolute", top: -4, right: -4, minWidth: 20, height: 20, px: 0.5, borderRadius: 999, bgcolor: "var(--c-brand)", color: "var(--c-brand-text)", fontSize: "0.72rem", fontWeight: 900, display: "grid", placeItems: "center", border: "2px solid var(--c-page)" }}>
                  {unread > 9 ? "9+" : unread}
                </Box>
              )}
            </Box>
            <Box component={NextLink} href="/perfil" aria-label="Mi perfil" sx={{ display: "flex", alignItems: "center", gap: 1.25, textDecoration: "none", color: "inherit", borderRadius: "12px" }}>
              <Avatar name={name} size={40} playerId={playerId} />
              <Box sx={{ display: { xs: "none", lg: "block" }, lineHeight: 1.2 }}>
                <Box sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{name}</Box>
                <Box sx={{ fontSize: "0.76rem", color: "text.secondary" }}>{role}</Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box component="main" sx={{ flex: 1, px: { xs: 2.5, md: 5 }, py: { xs: 3, md: 5 }, pb: { xs: 12, md: 6 }, maxWidth: 1600, width: "100%" }}>
          <Box key={pathname} className="page-in">{children}</Box>
        </Box>
      </Box>

      {/* Botón rápido para armar un picado (celular) */}
      {["/inicio", "/partidos", "/explorar", "/equipos"].some((p) => pathname === p) && (
        <Box
          component={NextLink} href="/partidos/nuevo?tipo=picado" aria-label="Armar un picado"
          sx={{
            display: { xs: "flex", md: "none" }, position: "fixed", right: 16, bottom: "calc(76px + env(safe-area-inset-bottom))", zIndex: 11,
            alignItems: "center", gap: 1, px: 2.25, height: 52, borderRadius: 999, textDecoration: "none", fontWeight: 800,
            bgcolor: "var(--c-brand)", color: "var(--c-brand-text)", boxShadow: "0 3px 0 0 rgba(14,26,58,.92), 0 8px 20px rgba(14,26,58,.25)",
            "&:active": { transform: "translateY(2px)" },
          }}
        >
          <Icon name="plus" size={22} /> Armar picado
        </Box>
      )}

      {/* Navegación inferior (celular) */}
      <Box
        component="nav"
        aria-label="Principal"
        sx={{
          display: { xs: "grid", md: "none" },
          gridTemplateColumns: "repeat(5, 1fr)",
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          bgcolor: "var(--c-sidebar)",
          pb: "env(safe-area-inset-bottom)",
          borderTop: "1px solid rgba(255,255,255,.1)",
        }}
      >
        {NAV.filter((n) => n.href !== "/rankings").map((n) => {
          const on = active(n.href);
          return (
            <Box
              key={n.href}
              component={NextLink}
              href={n.href}
              aria-current={on ? "page" : undefined}
              sx={{
                display: "grid",
                justifyItems: "center",
                gap: 0.4,
                py: 1,
                textDecoration: "none",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: on ? "var(--c-sidebar-active)" : "var(--c-sidebar-muted)",
              }}
            >
              <Icon name={n.icon} size={24} />
              {n.label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
