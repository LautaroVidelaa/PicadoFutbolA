import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Icon from "@/components/Icon";
import { PageHead } from "@/components/ui";
import { logoutAction } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function PerfilPage() {
  const user = await requireUser();
  const me = await prisma.player.findUnique({ where: { userId: user.id }, select: { discoverable: true, photoUrl: true } });
  return (
    <>
      <PageHead
        title="Tu perfil."
        lead="Así te ven tus compañeros. Elegí tu posición y tu número de camiseta."
      />
      <ProfileForm
        initial={{ since: user.since, firstName: user.firstName, lastName: user.lastName, position: user.position, number: user.number, discoverable: me?.discoverable ?? true, playerId: user.playerId, hasPhoto: !!me?.photoUrl }}
      />
      <Box sx={{ mt: 5, pt: 3, borderTop: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Typography color="text.secondary">Sesión iniciada como {user.fullName}.</Typography>
        <form action={logoutAction}>
          <Button type="submit" variant="outlined" color="inherit" startIcon={<Icon name="logout" size={18} />}>
            Cerrar sesión
          </Button>
        </form>
      </Box>
    </>
  );
}
