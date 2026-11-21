import type { DefaultSession } from "next-auth";

// Le decimos a TypeScript que la sesión incluye el id del usuario
declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}
