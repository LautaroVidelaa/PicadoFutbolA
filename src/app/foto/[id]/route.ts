import { createHash } from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GIF transparente de 1x1: si no hay foto, se ven las iniciales de abajo y no un ícono de imagen rota
const EMPTY = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), (c) => c.charCodeAt(0));
const empty = () => new Response(EMPTY, { headers: { "Content-Type": "image/gif", "Cache-Control": "private, max-age=60" } });

const DATA_URL = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/;

// Sirve la foto de un jugador. Hace falta tener sesión para verla.
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return empty();
  const { id } = await ctx.params;
  const player = await prisma.player.findUnique({ where: { id }, select: { photoUrl: true } });
  const m = player?.photoUrl ? DATA_URL.exec(player.photoUrl) : null;
  if (!m) return empty();

  const bytes = Buffer.from(m[2], "base64");
  const etag = `"${createHash("sha1").update(bytes).digest("hex")}"`;
  const headers = { "Content-Type": m[1], "Cache-Control": "private, no-cache", ETag: etag, "X-Content-Type-Options": "nosniff" };
  if (req.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
  return new Response(new Uint8Array(bytes), { headers });
}
