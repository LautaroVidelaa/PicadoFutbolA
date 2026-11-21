# ⚽ FutbolApp

El lugar donde queda registrada toda tu historia futbolística.

**Stack:** Next.js (App Router) + TypeScript, Material UI, MySQL, Prisma, Auth.js.

## Cómo correrlo

1. Instalá las dependencias:
   ```bash
   npm install
   ```
2. Creá una base vacía en MySQL:
   ```sql
   CREATE DATABASE futbolapp CHARACTER SET utf8mb4;
   ```
3. Copiá `.env.example` a `.env` y completá `DATABASE_URL` y `AUTH_SECRET`.
4. Validá el schema, creá las tablas y generá el cliente de Prisma:
   ```bash
   npx prisma validate
   npx prisma migrate dev --name init
   ```
5. Levantá la app:
   ```bash
   npm run dev
   ```
   Abrila en http://localhost:3000

## Estructura

```
prisma/schema.prisma   Modelo de datos (usuarios, jugadores, equipos, partidos, goles)
src/lib/prisma.ts      Cliente de Prisma compartido
src/auth.ts            Configuración de Auth.js (login con email y contraseña)
src/app/actions/auth.ts  Server actions: registro, login y logout
src/app/registro       Página de registro
src/app/login          Página de login
src/app/inicio         Página protegida (requiere sesión)
src/app/layout.tsx     Layout con Material UI
src/app/page.tsx       Home pública
```

## Modelo de datos en una línea

- **User**: la cuenta.
- **Player**: la identidad futbolística. Puede existir sin cuenta (`userId` vacío) y reclamarse después con `claimCode`.
- **Team** / **TeamMember**: un jugador puede estar en muchos equipos, con fechas de ingreso y salida (la "carrera").
- **Match**: el partido, con `shareCode` para el link público `/p/<shareCode>`.
- **MatchPlayer**: quién jugó, de qué lado, y su posición en la cancha (`posX`, `posY`).
- **Goal**: goleador, asistente opcional y equipo al que suma.

Las estadísticas (goles, asistencias, victorias, etc.) **no se guardan**: se calculan desde partidos y goles, así nunca quedan desactualizadas.

## Próximos pasos

1. ✅ Registro y login (Auth.js con credenciales).
2. Crear equipos y jugadores.
3. Crear partido y generar el link público.
4. Página pública `/p/[code]` con vista previa para WhatsApp.
5. Cargar resultado, goles y asistencias.
6. Perfil con historial y estadísticas.
