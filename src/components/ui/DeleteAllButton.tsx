"use client";

import { IconTrash } from "@/components/nav/icons";

export function DeleteAllButton({
  action,
  confirmMessage,
  label = "Borrar todo",
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  label?: string;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        onClick={(event) => {
          if (!window.confirm(confirmMessage)) {
            event.preventDefault();
          }
        }}
        className="flex items-center gap-1.5 rounded-full border border-danger/30 px-3.5 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
      >
        <IconTrash className="h-4 w-4" />
        {label}
      </button>
    </form>
  );
}
