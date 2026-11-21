import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Bloque del panel de inicio: título + contenido (normalmente un estado vacío)
export default function Panel({
  title,
  area,
  children,
}: {
  title: string;
  area?: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      component="section"
      sx={{
        gridArea: area,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px",
        p: { xs: 2.5, md: 3 },
      }}
    >
      <Typography variant="h3" sx={{ fontSize: "1.9rem", mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
