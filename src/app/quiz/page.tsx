import type { Metadata } from "next";
import { QuizGame } from "./quiz-game";

export const metadata: Metadata = { title: "이름 맞추기 퀴즈" };

export default async function QuizPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  return (
    <main className="mx-auto max-w-[1400px] px-4 pt-10 pb-16 md:px-10 md:pt-16">
      <h1 className="text-[2rem] leading-tight font-black tracking-[-0.03em] md:text-5xl">이름 맞추기 퀴즈</h1>
      <p className="mt-3 max-w-[56ch] text-ink-2 md:text-lg">실루엣이나 일러스트 일부를 보고 니케 이름을 맞혀 보세요.</p>
      <QuizGame initialType={type === "illust" ? "illust" : "silhouette"} />
    </main>
  );
}
