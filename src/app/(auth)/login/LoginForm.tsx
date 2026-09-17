"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/Field";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-semibold tracking-tight">
        Iniciar sesión
      </h1>

      <div className="flex flex-col gap-4">
        <FieldGroup label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </FieldGroup>
        <FieldGroup label="Contraseña" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </FieldGroup>

        {state.error && (
          <p className="text-sm text-danger">{state.error}</p>
        )}

        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? "Entrando…" : "Entrar"}
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-secondary">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-medium text-accent">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
