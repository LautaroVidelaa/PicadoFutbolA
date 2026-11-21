import AppShell from "@/components/AppShell";
import { POSITIONS } from "@/lib/player";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

// Todo lo que está dentro de (app) requiere sesión y usa el mismo marco
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const role = POSITIONS.find((p) => p.value === user.position)?.label ?? "Jugador";
  const unread = await prisma.notification.count({ where: { userId: user.id, readAt: null } });
  return (
    <AppShell name={user.fullName} role={role} playerId={user.playerId} unread={unread}>
      {children}
    </AppShell>
  );
}
