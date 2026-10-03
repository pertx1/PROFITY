import "server-only";
import { createHash, randomBytes } from "node:crypto";

/**
 * Conexión con Antola: cada usuario genera su propia clave. Solo se guarda su
 * hash (SHA-256): si alguien viera la base de datos, no podría usarla.
 */
export function newAntolaToken() {
  return `pf_${randomBytes(32).toString("base64url")}`;
}

export function hashAntolaToken(token: string) {
  return createHash("sha256").update(token.trim()).digest("hex");
}
