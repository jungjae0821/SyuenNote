import type { Metadata } from "next";
import { Suspense } from "react";
import { nikkes } from "@/data/nikkes";
import { DexBrowser, NikkeGrid } from "./dex-browser";

export const metadata: Metadata = {
  title: "니케 도감",
  description: "플레이어블 니케 전원을 이름, 등급, 제조사, 버스트, 클래스, 속성, 무기로 찾아봅니다.",
};

export default function DexPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-4 pt-8 md:px-10 md:pt-12">
      <h1 className="text-[2rem] leading-tight font-black tracking-[-0.03em] md:text-5xl">니케 도감</h1>
      <p className="mt-2 mb-6 max-w-[56ch] text-ink-2 md:text-lg">
        플레이어블 니케 {nikkes.length}명을 이름과 조건으로 찾아봅니다.
      </p>
      {/* 필터는 주소의 쿼리를 읽으므로, 미리 그려 두는 HTML에는 필터 없이 전체 목록을 넣는다. */}
      <Suspense fallback={<NikkeGrid nikkes={nikkes} />}>
        <DexBrowser />
      </Suspense>
    </main>
  );
}
