# PROFITY

Gastos, pedidos y beneficio de tu negocio, siempre a mano, desde cualquier
dispositivo. Sustituye tu Excel por una web con login y base de datos.

## Qué incluye

- **Login** con email y contraseña (sesión guardada 30 días).
- **Gastos**: alta, edición, borrado, búsqueda e importación desde Excel.
- **Pedidos**: alta, edición, borrado, búsqueda, estado (sin hacer / en
  casa / en paquete / enviado / sin llegar / cancelado) e importación
  desde Excel. El "número de pedido" también acepta nombres (pedidos
  informales sin número).
- **Beneficio**: resumen de ingresos, gastos y beneficio, total y del mes,
  con un gráfico de los últimos 6 meses.
- **Estadísticas**: modelos y combinaciones modelo+talla más vendidas,
  colores más vendidos, y en qué categorías se va más el dinero. El rango
  de fechas es configurable (24h, 7/30/90/100/365 días o personalizado).

Los datos se guardan en una base de datos Postgres (no en el navegador),
así que entras desde el móvil, la tablet o el ordenador y siempre ves lo
mismo.

## Cómo usarlo gratis (recomendado: Vercel + Neon)

Con esta combinación no pagas nada para uso personal:

1. **Base de datos — [Neon](https://neon.tech)** (Postgres gratis, sin
   tarjeta): crea una cuenta, crea un proyecto, y copia la cadena de
   conexión (`postgresql://...`) que te dan. El plan gratuito incluye
   0.5 GB de almacenamiento y cómputo de sobra para un negocio pequeño.
2. **Hosting — [Vercel](https://vercel.com)** (plan Hobby, gratis para uso
   personal/no comercial): crea una cuenta, conecta tu GitHub y elige este
   repositorio (`pertx1/PROFITY`) para importarlo como proyecto nuevo.
3. En la configuración del proyecto en Vercel, añade estas variables de
   entorno:
   - `DATABASE_URL`: la cadena de conexión de Neon del paso 1.
   - `AUTH_SECRET`: genera una con
     `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
     y pégala tal cual.
4. Despliega. Vercel instala dependencias (`postinstall` ya genera el
   cliente de Prisma) y construye la app automáticamente.
5. Antes de poder entrar necesitas crear las tablas en tu base de Neon.
   Desde tu ordenador, con el mismo `DATABASE_URL` en tu `.env` local:
   ```bash
   npm run db:deploy   # aplica las migraciones a la base de datos real
   ```
   Si no tienes el proyecto en tu ordenador, puedes ejecutar el SQL de
   `prisma/migrations/*/migration.sql` directamente desde el **SQL
   Editor** de Neon (uno por uno, en orden).
6. Entra en la URL que te da Vercel (algo como
   `https://profity-tuusuario.vercel.app`), regístrate, y usa el botón
   **"Importar Excel"** de las páginas de Gastos y Pedidos para meter tus
   datos — no hace falta ni SQL ni tocar la base de datos a mano.

**Importante sobre el plan gratuito de Vercel**: el plan Hobby es gratis
solo para uso personal/no comercial (no para vender un producto a
terceros). Usarlo como herramienta interna para llevar tus propias cuentas
entra dentro de ese uso; si en algún momento quisieras ofrecer PROFITY como
servicio a otras personas, tocaría mirar un plan de pago.

## Cómo arrancarlo en local

```bash
npm install
npm run db:migrate   # crea las tablas en tu base de datos (usa DATABASE_URL de .env)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000), regístrate con tu
email y empieza a meter datos. Para desarrollo local puedes usar la misma
base de datos gratuita de Neon (más simple) o una Postgres local.

### Importar tu Excel

En las páginas de **Gastos** y **Pedidos** hay un botón **"Importar
Excel"**: sube tu `.xlsx` (puedes subir el libro completo con todas las
hojas, o solo la hoja suelta — detecta la hoja correcta por su nombre, y
si hay varias hojas de pedidos tipo "Pedidos" y "Pedidos EH" las junta
todas). No se salta ninguna fila por datos incompletos: si falta la
categoría, el modelo o el precio, rellena un valor por defecto en vez de
descartarla. El "número de pedido" también admite texto (pedidos
informales apuntados con un nombre en vez de un número).

Si el Excel no trae una fecha por pedido (lo habitual), las fechas se
reparten de forma proporcional dentro del rango de fechas de tus gastos,
para que el gráfico de evolución tenga sentido.

Importar no borra lo que ya tengas — si quieres empezar de cero, usa el
botón **"Borrar todo"** de cada página antes de reimportar.

## Variables de entorno

Copia `.env.example` a `.env` y ajusta:

- `DATABASE_URL`: cadena de conexión Postgres (Neon, Supabase, o local).
- `AUTH_SECRET`: secreto para firmar las sesiones. Genera uno propio con
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.

## Stack técnico

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma 7 +
Postgres (adapter `@prisma/adapter-pg`, pensado para Neon) + sesiones con
JWT firmado (`jose`) en cookie httpOnly + Recharts para los gráficos.
