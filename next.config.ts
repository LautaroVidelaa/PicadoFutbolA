import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oculta el botón de herramientas de desarrollo de Next.js (solo se ve con npm run dev)
  devIndicators: false,
  // Las tipografías de la imagen para compartir se leen del disco: hay que incluirlas al publicar
  outputFileTracingIncludes: {
    "/p/[code]/imagen": ["./src/assets/fonts/**/*"],
  },
};

export default nextConfig;
