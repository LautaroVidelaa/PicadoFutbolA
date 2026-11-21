import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import A from "@/components/A";
import { Card, PageHead } from "@/components/ui";
import { markAllReadAction } from "@/app/actions/notifications";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Notificaciones" };

const when = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

export default async function NotificacionesPage() {
  const user = await requireUser();
  const items = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <>
      <PageHead
        title="Novedades."
        lead="Cuando te suman a un partido, cargan un resultado o alguien entra a tu equipo, te enteras acá."
        action={unread > 0 ? (
          <form action={markAllReadAction}>
            <Button type="submit" variant="outlined" color="inherit">Marcar todas como leídas</Button>
          </form>
        ) : undefined}
      />
      {items.length === 0 ? (
        <Card sx={{ textAlign: "center", py: { xs: 5, md: 7 } }}>
          <Typography variant="h3" sx={{ fontSize: "2rem", mb: 1 }}>Todo tranquilo por ahora.</Typography>
          <Typography color="text.secondary">Cuando pase algo en tus equipos o partidos, aparece acá.</Typography>
        </Card>
      ) : (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1.25, maxWidth: 760 }}>
          {items.map((n) => (
            <Box component="li" key={n.id}>
              <A
                href={n.href}
                sx={{ display: "block", textDecoration: "none", color: "inherit", p: 2, borderRadius: "14px", border: "1px solid", borderColor: n.readAt ? "var(--c-border)" : "var(--c-text)", bgcolor: n.readAt ? "var(--c-card)" : "var(--c-tint)" }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "baseline", flexWrap: "wrap" }}>
                  <Box sx={{ fontWeight: 800 }}>{!n.readAt && <Box component="span" aria-label="Sin leer" sx={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", bgcolor: "var(--c-brand)", border: "1.5px solid var(--c-text)", mr: 1 }} />}{n.title}</Box>
                  <Box sx={{ fontSize: "0.8rem", color: "text.secondary" }}>{when.format(n.createdAt)}</Box>
                </Box>
                {n.body && <Box sx={{ color: "text.secondary", fontSize: "0.92rem", mt: 0.5 }}>{n.body}</Box>}
              </A>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
