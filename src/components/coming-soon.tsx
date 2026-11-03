import Link from "next/link";

export function ComingSoon({ title, summary, features }: { title: string; summary: string; features: string[] }) {
  return (
    <main className="mx-auto max-w-[1400px] px-4 pt-10 md:px-10 md:pt-16">
      <h1 className="text-[2rem] leading-tight font-black tracking-[-0.03em] md:text-5xl">{title}</h1>
      <p className="mt-3 max-w-[56ch] text-ink-2 md:text-lg">{summary}</p>
      <div className="mt-8 max-w-xl rounded-xl bg-raise p-5">
        <h2 className="font-extrabold">준비 중인 기능</h2>
        <ul className="mt-3 grid gap-2 text-ink-2">
          {features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-violet" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <Link href="/" className="mt-6 inline-block font-bold text-violet hover:text-ink">
        홈으로 돌아가기
      </Link>
    </main>
  );
}
