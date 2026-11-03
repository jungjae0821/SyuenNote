"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/auth/actions";
import type { User } from "@/lib/auth";

// 헤더의 내 이름을 누르면 여는 메뉴. 로그아웃은 여기에만 있다.
export function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="user-menu"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 items-center gap-2 rounded-lg px-2 py-1 font-bold hover:bg-raise aria-expanded:bg-raise"
      >
        {user.avatarUrl ? (
          // 디스코드 CDN 아바타라 next/image 도메인 설정 없이 그대로 쓴다.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="size-8 rounded-full" />
        ) : (
          <span className="grid size-8 place-items-center rounded-full bg-raise-2 text-sm">{user.name.slice(0, 1)}</span>
        )}
        <span className="hidden max-w-32 truncate sm:inline">{user.name}</span>
        <span className="sr-only sm:hidden">{user.name} 메뉴</span>
      </button>

      {open && (
        <div id="user-menu" className="absolute top-full right-0 mt-2 grid w-44 gap-1 rounded-xl bg-raise-2 p-1.5 shadow-lg">
          <Link
            href="/me"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center rounded-lg px-3 font-bold hover:bg-white/10"
          >
            내 정보
          </Link>
          <form action={signOut}>
            <button className="flex min-h-11 w-full items-center rounded-lg px-3 text-left font-bold text-ink-2 hover:bg-white/10 hover:text-ink">
              로그아웃
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
