# PROFITY

Gastos, pedidos y beneficio de tu negocio, siempre a mano, desde cualquier
dispositivo. Sustituye tu Excel por una web con login y base de datos.

## Qué incluye

- **Login** con email y contraseña (sesión guardada 30 días).
- **Gastos**: alta, edición y borrado, con categoría y método de pago.
- **Pedidos**: alta, edición, borrado y estado (sin hacer / en casa / en
  paquete / enviado / sin llegar / cancelado).
- **Beneficio**: resumen de ingresos, gastos y beneficio, total y del mes,
  con un gráfico de los últimos 6 meses.
- **Estadísticas**: modelos y combinaciones modelo+talla más vendidas,
  colores más vendidos, y en qué categorías se va más el dinero.

Todos los datos se guardan en una base de datos (no en el navegador), así
que entras desde el móvil, la tablet o el ordenador y siempre ves lo mismo.

## Cómo arrancarlo en local

```bash
npm install
npm run db:migrate   # crea la base de datos SQLite (dev.db)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000), regístrate con tu email
y empieza a meter datos.

### Tus datos del Excel ya están importados

Al preparar el proyecto importé tus gastos y pedidos del Excel
`AKERRA20_version_1.xlsx` a una cuenta ya creada:

- Email: `mnysoon@gmail.com`
- Contraseña temporal: la que te indiqué en el chat al terminar. Puedes
  cambiarla borrando la fila `User` correspondiente y volviendo a
  registrarte, o pedirme que añada una pantalla de "cambiar contraseña".

El Excel original no guardaba una fecha por pedido (solo por gasto), así
que las fechas de los pedidos importados se han repartido de forma
proporcional dentro del rango de fechas de tus gastos, para que el gráfico
de evolución tenga sentido. Los importes y el resto de datos son los
reales de tu Excel.

Si quieres reimportar desde otro Excel, genera un `seed-data.json` (ver
`scripts/seed.ts` para el formato) y ejecuta `npm run db:seed`. El script
no borra datos existentes: si la cuenta ya tiene gastos o pedidos, no hace
nada (para evitar duplicar).

## Base de datos: SQLite en local, Postgres en producción

Este proyecto usa SQLite (`dev.db`) por defecto porque no necesita ningún
servicio externo para empezar. Funciona perfectamente si despliegas la app
en un servidor/contenedor que mantiene el disco entre peticiones.

**Si despliegas en una plataforma serverless (por ejemplo Vercel), SQLite
no es buena idea**: el disco no persiste entre invocaciones y perderías
datos. Para producción, lo más sencillo es cambiar a Postgres:

1. Crea una base de datos Postgres gratuita (por ejemplo en
   [Neon](https://neon.tech) o [Supabase](https://supabase.com)).
2. Cambia en `prisma/schema.prisma` el datasource a `provider = "postgresql"`.
3. Cambia `src/lib/prisma.ts` para usar `@prisma/adapter-pg` en vez de
   `@prisma/adapter-better-sqlite3` (`npm install @prisma/adapter-pg pg`).
4. Pon la cadena de conexión en `DATABASE_URL` (variable de entorno en el
   panel de tu hosting, nunca en el repositorio).
5. Ejecuta `npm run db:migrate` una vez contra esa base de datos.

## Variables de entorno

Copia `.env.example` a `.env` y ajusta:

- `DATABASE_URL`: cadena de conexión de la base de datos.
- `AUTH_SECRET`: secreto para firmar las sesiones. Genera uno propio con
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.

## Stack técnico

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma 7 + SQLite
(adapter `better-sqlite3`) + sesiones con JWT firmado (`jose`) en cookie
httpOnly + Recharts para los gráficos.
