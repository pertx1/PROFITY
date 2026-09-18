import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta la variable de entorno DATABASE_URL");
  }
  const adapter = new PrismaPg(connectionString);
  return new PrismaClient({ adapter });
}

// El cliente se crea de forma perezosa, en el primer uso real, para que
// solo importar este módulo (por ejemplo durante "next build") no exija
// tener DATABASE_URL disponible ni intente conectar con la base de datos.
function getPrismaClient() {
  if (!globalThis.__prisma) {
    globalThis.__prisma = createPrismaClient();
  }
  return globalThis.__prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getPrismaClient(), prop, receiver);
  },
});
