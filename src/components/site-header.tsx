import Link from "next/link";
import { Suspense } from "react";
import { NavLinks } from "./nav-links";
import { UserButton } from "./user-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/60 bg-ground/90 backdrop-blur">
      <nav
        aria-label="주 메뉴"
        className="mx-auto flex h-14 max-w-[1400px] items-center gap-8 px-4 md:h-16 md:px-10"
      >
        <Link href="/" className="text-[22px] font-black tracking-[-0.03em]">
          슈엔<span className="text-violet">노트</span>
        </Link>
        <NavLinks />
        <div className="ml-auto">
          <Suspense fallback={<div className="h-11 w-36 rounded-lg bg-raise" />}>
            <UserButton />
          </Suspense>
        </div>
      </nav>
    </header>
  );
}
