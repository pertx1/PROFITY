import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getStockOverview } from "@/lib/stock";

export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * Integración con Antola: lo que hay que pedir (stock a 0 o menos, igual que
 * la lista «Hay que pedir» de Stock). Solo de la cuenta ANTOLA_PROFITY_EMAIL
 * y con la clave ANTOLA_TOKEN en la cabecera «Authorization: Bearer …».
 * Sin esas variables, la ruta no existe (404).
 */
export async function GET(request: Request) {
  const token = process.env.ANTOLA_TOKEN?.trim();
  const email = process.env.ANTOLA_PROFITY_EMAIL?.trim();
  if (!token || !email) return Response.json({ error: "La integración con Antola no está configurada" }, { status: 404 });

  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";
  if (!safeEqual(given, token)) return Response.json({ error: "Clave incorrecta" }, { status: 401 });

  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } });
  if (!user) return Response.json({ error: "No existe ninguna cuenta con ANTOLA_PROFITY_EMAIL" }, { status: 404 });

  const { needsOrder } = await getStockOverview(user.id);
  return Response.json(
    { items: needsOrder.map(({ key, label, quantity }) => ({ key, label, quantity })) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
