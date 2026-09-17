import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión · PROFITY" };

export default function LoginPage() {
  return <LoginForm />;
}
