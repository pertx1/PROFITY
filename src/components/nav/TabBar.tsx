"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { navItems } from "./nav-items";

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex overflow-x-auto border-t border-border bg-surface/70 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 md:hidden">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex min-w-[64px] flex-1 shrink-0 flex-col items-center gap-1 px-1 py-2 text-[11px] font-medium whitespace-nowrap"
          >
            <span
              className={cn(
                "flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-200 ease-spring",
                active ? "bg-accent/15 text-accent" : "text-secondary",
              )}
            >
              <Icon className="h-6 w-6" />
            </span>
            <span className={cn(active ? "text-accent" : "text-secondary")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
