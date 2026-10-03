import { prisma } from "@/lib/prisma";
import { hashAntolaToken } from "@/lib/antola";
import { getStockOverview } from "@/lib/stock";

export const dynamic = "force-dynamic";

/**
 * Integración con Antola: lo que hay que pedir (stock a 0 o menos, igual que
 * la lista «Hay que pedir» de Stock) de la cuenta dueña de la clave. Cada
 * usuario genera su clave en Ajustes → Conectar con Antola y la pega en
 * Antola; va en la cabecera «Authorization: Bearer …».
 */
export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";
  if (token.length < 20 || token.length > 200) return Response.json({ error: "Clave incorrecta" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { antolaTokenHash: hashAntolaToken(token) }, select: { id: true } });
  if (!user) return Response.json({ error: "Clave incorrecta" }, { status: 401 });

  const { needsOrder } = await getStockOverview(user.id);
  return Response.json(
    { items: needsOrder.map(({ key, label, quantity }) => ({ key, label, quantity })) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
