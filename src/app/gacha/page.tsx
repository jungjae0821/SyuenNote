import type { Metadata } from "next";
import { GachaSim } from "./gacha-sim";

export const metadata: Metadata = { title: "가챠 시뮬레이터" };

export default function GachaPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-4 pt-10 pb-16 md:px-10 md:pt-16">
      <h1 className="text-[2rem] leading-tight font-black tracking-[-0.03em] md:text-5xl">가챠 시뮬레이터</h1>
      <p className="mt-3 max-w-[56ch] text-ink-2 md:text-lg">
        쥬얼 걱정 없이 가챠를 돌려 보세요!
      </p>
      <GachaSim />
    </main>
  );
}
