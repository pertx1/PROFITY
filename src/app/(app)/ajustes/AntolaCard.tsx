"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createAntolaTokenAction, revokeAntolaTokenAction } from "./actions";

/**
 * Conectar con Antola: genera una clave personal para pegarla en Antola. Así
 * cada artículo que haya que pedir le aparece como tarea. La clave solo se
 * muestra una vez (aquí se guarda cifrada).
 */
export function AntolaCard({ connectedAt }: { connectedAt: string | null }) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function generate() {
    if (connectedAt && !confirm("Se generará una clave nueva y la anterior dejará de funcionar. ¿Seguir?")) return;
    startTransition(async () => {
      const res = await createAntolaTokenAction();
      if (res.error || !res.token) setError(res.error ?? "No se ha podido generar la clave");
      else {
        setError(null);
        setCopied(false);
        setToken(res.token);
      }
    });
  }

  function disconnect() {
    if (!confirm("Antola dejará de recibir tu stock. ¿Desconectar?")) return;
    startTransition(async () => {
      await revokeAntolaTokenAction();
      setToken(null);
    });
  }

  async function copy() {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold">Conectar con Antola</h2>
      <p className="mt-0.5 text-xs text-secondary">
        Cada artículo que tengas que pedir (stock a 0 o menos) te aparecerá en Antola como una tarea, con aviso en el móvil.
      </p>

      {token ? (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-sm font-medium">Tu clave para Antola:</p>
          <input
            readOnly
            value={token}
            onFocus={(e) => e.currentTarget.select()}
            className="min-h-11 w-full rounded-xl border border-border bg-background px-3 font-mono text-sm"
            aria-label="Clave para Antola"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={copy}>
              {copied ? "¡Copiada!" : "Copiar clave"}
            </Button>
          </div>
          <p className="text-xs text-secondary">
            Pégala en Antola → Ajustes → Profity. Por seguridad no se volverá a mostrar: si la pierdes, genera otra.
          </p>
        </div>
      ) : connectedAt ? (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-sm">
            ✅ Clave creada el {new Date(connectedAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" disabled={pending} onClick={generate}>
              Generar clave nueva
            </Button>
            <Button type="button" variant="ghost" disabled={pending} onClick={disconnect}>
              Desconectar
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <Button type="button" disabled={pending} onClick={generate}>
            {pending ? "Generando…" : "Generar clave para Antola"}
          </Button>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Card>
  );
}
