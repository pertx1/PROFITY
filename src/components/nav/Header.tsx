import { logoutAction } from "@/app/(app)/actions";
import { IconLogout } from "./icons";

export function Header({ name }: { name: string | null }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface/80 px-5 py-4 backdrop-blur md:px-8">
      <div>
        <p className="text-sm text-secondary">Hola{name ? `, ${name}` : ""}</p>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:bg-black/[.04] hover:text-foreground dark:hover:bg-white/[.06]"
        >
          <IconLogout className="h-4 w-4" />
          Salir
        </button>
      </form>
    </header>
  );
}
