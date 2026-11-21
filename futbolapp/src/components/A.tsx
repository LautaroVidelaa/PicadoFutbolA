"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

// Link de Next con estilos sx. Vive en un componente cliente para poder
// usarse desde páginas de servidor (no se pueden pasar funciones como component={Link}).
export default function A({
  href,
  sx,
  children,
  ...rest
}: {
  href: string;
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  className?: string;
  role?: string;
  "aria-selected"?: boolean;
  "aria-current"?: "page";
}) {
  return (
    <Box component={NextLink} href={href} sx={sx} {...rest}>
      {children}
    </Box>
  );
}
