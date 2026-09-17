"use client";

import { IconTrash } from "@/components/nav/icons";

export function DeleteButton({ confirmMessage }: { confirmMessage: string }) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      aria-label="Eliminar"
      className="flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
    >
      <IconTrash className="h-4 w-4" />
    </button>
  );
}
