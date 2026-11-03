import type { Metadata } from "next";
import { Suspense } from "react";
import { signInWithDiscord } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { MyGame } from "./my-game";

export const metadata: Metadata = { title: "내 정보" };

const errorMessages: Record<string, string> = {
  "not-configured": "로그인 서버가 아직 설정되지 않았습니다. .env.local에 Supabase 주소와 키를 넣은 뒤 다시 시도하세요.",
  "login-failed": "디스코드 로그인을 마치지 못했습니다. 다시 로그인해 주세요.",
};

export default function MePage({ searchParams }: PageProps<"/me">) {
  return (
    <main className="mx-auto max-w-[1400px] px-4 pt-10 md:px-10 md:pt-16">
      <h1 className="text-[2rem] leading-tight font-black tracking-[-0.03em] md:text-5xl">내 정보</h1>
      <Suspense fallback={<div className="mt-8 h-40 rounded-xl bg-raise" />}>
        <Account searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Account({ searchParams }: Pick<PageProps<"/me">, "searchParams">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? errorMessages[error] : undefined;
  const user = await getCurrentUser();

  return (
    <div className="mt-8 grid items-start gap-4 md:grid-cols-2">
      {message && (
        <p role="alert" className="rounded-xl bg-[#3b1a2a] p-4 text-[#ffd0dc] md:col-span-2">
          {message}
        </p>
      )}

      {user ? (
        <MyGame />
      ) : (
        // 내 정보는 로그인한 사용자만 본다. 로그인하면 /auth/callback이 이 페이지로 돌려보낸다.
        <section className="rounded-xl bg-raise p-5">
          <h2 className="text-lg font-extrabold">로그인이 필요합니다</h2>
          <p className="mt-1 text-ink-2">내 정보는 디스코드로 로그인한 뒤에 볼 수 있습니다.</p>
          <form action={signInWithDiscord} className="mt-4">
            <button className="rounded-lg bg-ink px-4 py-2.5 font-extrabold text-ground hover:opacity-85">
              디스코드로 로그인
            </button>
          </form>
          {!isSupabaseConfigured && (
            <p className="mt-3 text-sm text-ink-2">개발 환경: Supabase 키가 없어 로그인이 꺼져 있습니다.</p>
          )}
        </section>
      )}
    </div>
  );
}
