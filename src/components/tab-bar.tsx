"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isActive, navItems, type NavHref } from "./nav-items";

const icons: Record<NavHref, ReactNode> = {
  "/dex": (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h12v15H6a2 2 0 0 0-2 2z" />
      <path d="M4 20a2 2 0 0 0 2 1h12v-3" />
    </>
  ),
  "/gacha": (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="m12 8 1.4 2.8 3.1.5-2.2 2.1.5 3-2.8-1.4-2.8 1.4.5-3-2.2-2.1 3.1-.5z" />
    </>
  ),
  "/quiz": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.2a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.5M12 17h.01" />
    </>
  ),
  "/me": (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.4-3.8 4.4-6 8-6s6.6 2.2 8 6" />
    </>
  ),
};

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-ground/95 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
    >
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`grid min-h-12 justify-items-center gap-0.5 text-xs font-bold ${
              active ? "text-ink" : "text-ink-2"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={`size-6 fill-none stroke-current stroke-[1.8] ${active ? "text-violet" : ""}`}
            >
              {icons[item.href]}
            </svg>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
