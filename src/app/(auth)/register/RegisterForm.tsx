"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/Field";
import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-semibold tracking-tight">
        Crear cuenta
      </h1>

      <div className="flex flex-col gap-4">
        <FieldGroup label="Nombre" htmlFor="name">
          <Input id="name" name="name" type="text" autoComplete="name" required />
        </FieldGroup>
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
            autoComplete="new-password"
            minLength={8}
            required
          />
        </FieldGroup>

        {state.error && (
          <p className="text-sm text-danger">{state.error}</p>
        )}

        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-secondary">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-accent">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
