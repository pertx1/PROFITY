import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";
import { normalizeOrderStatus } from "../src/lib/order-status";

type SeedExpense = {
  date: string;
  category: string;
  concept: string | null;
  amount: number;
  paymentMethod: string | null;
};

type SeedOrder = {
  orderNumber: number;
  quantity: number;
  model: string;
  color: string | null;
  size: string | null;
  price: number;
  status: string | null;
};

async function main() {
  const email = process.env.SEED_EMAIL ?? "mnysoon@gmail.com";
  const name = process.env.SEED_NAME ?? "Akerra20";
  const dataPath = process.argv[2] ?? "seed-data.json";

  if (!existsSync(dataPath)) {
    console.error(`No se encontró ${dataPath}. Nada que importar.`);
    process.exit(1);
  }

  const { gastos, pedidos } = JSON.parse(readFileSync(dataPath, "utf-8")) as {
    gastos: SeedExpense[];
    pedidos: SeedOrder[];
  };

  let user = await prisma.user.findUnique({ where: { email } });
  let generatedPassword: string | null = null;

  if (!user) {
    generatedPassword = randomBytes(6).toString("base64url");
    user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: await hashPassword(generatedPassword),
      },
    });
  }

  const existingExpenses = await prisma.expense.count({
    where: { userId: user.id },
  });
  const existingOrders = await prisma.order.count({
    where: { userId: user.id },
  });

  if (existingExpenses > 0 || existingOrders > 0) {
    console.log(
      `La cuenta ${email} ya tiene datos (${existingExpenses} gastos, ${existingOrders} pedidos). No se importa nada para evitar duplicados.`,
    );
    return;
  }

  await prisma.expense.createMany({
    data: gastos.map((g) => ({
      userId: user!.id,
      date: new Date(g.date),
      category: g.category,
      concept: g.concept,
      amount: g.amount,
      paymentMethod: g.paymentMethod,
    })),
  });

  // El Excel original no guardaba una fecha por pedido: se reparten de
  // forma proporcional dentro del rango de fechas de los gastos, en el
  // mismo orden que el número de pedido, para poder ver una evolución
  // temporal razonable en el panel de estadísticas.
  const expenseDates = gastos.map((g) => new Date(g.date).getTime());
  const minDate = Math.min(...expenseDates);
  const maxDate = Math.max(...expenseDates);
  const sortedOrders = [...pedidos].sort(
    (a, b) => a.orderNumber - b.orderNumber,
  );

  await prisma.order.createMany({
    data: sortedOrders.map((p, index) => {
      const t =
        sortedOrders.length > 1 ? index / (sortedOrders.length - 1) : 0;
      const date = new Date(minDate + t * (maxDate - minDate));
      return {
        userId: user!.id,
        date,
        orderNumber: p.orderNumber,
        quantity: p.quantity,
        model: p.model,
        color: p.color,
        size: p.size,
        price: p.price,
        status: normalizeOrderStatus(p.status),
      };
    }),
  });

  console.log(
    `Importados ${gastos.length} gastos y ${pedidos.length} pedidos para ${email}.`,
  );
  if (generatedPassword) {
    console.log(`Cuenta creada. Contraseña temporal: ${generatedPassword}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
