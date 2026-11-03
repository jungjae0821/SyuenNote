import Link from "next/link";
import { Row, Tile } from "@/components/title-wall";
import { manufacturers, nikkeImageUrl, nikkes } from "@/data/nikkes";
import { dexHref } from "./dex/filters";

export default function Home() {
  return (
    <main>
      <Hero />
      {manufacturers.map((maker) => (
        <Row
          key={maker}
          title={maker}
          action={
            <Link href={dexHref("maker", maker)} className="-my-3 shrink-0 py-3 text-sm font-bold text-ink-2 hover:text-ink">
              도감에서 보기
            </Link>
          }
        >
          {nikkes
            .filter((nikke) => nikke.manufacturer === maker)
            .map((nikke) => (
              <Tile
                key={nikke.id}
                href={`/dex/${nikke.id}`}
                name={nikke.name}
                rarity={nikke.rarity}
                detail={`${nikke.class} · ${nikke.weapon} · 버스트 ${nikke.burst}`}
                image={nikkeImageUrl(nikke)}
              />
            ))}
        </Row>
      ))}
      <Row title="이름 맞추기 퀴즈">
        <Tile wide href="/quiz?type=silhouette" name="실루엣" detail="그림자만 보고 니케 이름 맞추기" />
        <Tile wide href="/quiz?type=illust" name="일러스트"detail="일러스트 일부를 보고 이름 맞추기" />
      </Row>
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(110%_90%_at_78%_20%,#3d2468_0%,#1b1328_55%,var(--ground)_100%)]">
      <div className="mx-auto grid max-w-[1400px] items-end gap-10 px-4 pt-12 pb-10 md:grid-cols-[1fr_auto] md:px-10 md:pt-20 md:pb-16">
        <div>
          <h1 className="max-w-[12ch] text-[2.5rem] leading-[1.05] font-black tracking-[-0.035em] md:text-[4rem]">
            가챠 시뮬레이터
          </h1>
          <p className="mt-3 max-w-[38ch] text-base text-ink-2 md:text-lg">
            일반 모집과 픽업 모집을 실제 확률대로 뽑아 봅니다. 뽑은 SSR과 소모 쥬얼은 누적 기록으로 남습니다.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 text-xs font-extrabold">
            <li className="rounded-md bg-ssr px-2 py-1 text-ground">SSR 4%</li>
            <li className="rounded-md bg-white/10 px-2 py-1">통상 픽업 2%</li>
            <li className="rounded-md bg-white/10 px-2 py-1">오버스펙/필그림 1%</li>
            <li className="rounded-md bg-white/10 px-2 py-1">200회 마일리지 교환</li>
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/gacha"
              className="rounded-lg bg-ink px-5 py-3 text-base font-extrabold text-ground transition-opacity hover:opacity-85"
            >
              모집하러 가기
            </Link>
          </div>
        </div>
        <CardStack />
      </div>
    </section>
  );
}

// 모집 카드 뒷면 세 장. SSR 한 장만 금색 테두리로 빛난다.
function CardStack() {
  return (
    <div aria-hidden="true" className="relative mx-auto h-56 w-60 md:mr-16 md:h-80 md:w-80">
      <div className="absolute top-6 left-2 h-44 w-32 -rotate-12 rounded-xl border border-line bg-raise md:h-64 md:w-44" />
      <div className="absolute top-2 right-2 h-44 w-32 rotate-12 rounded-xl border border-line bg-raise md:h-64 md:w-44" />
      <div className="absolute top-0 left-1/2 h-48 w-34 -translate-x-1/2 rounded-xl border-2 border-ssr bg-[linear-gradient(160deg,#3a2560,#1d1629)] shadow-[0_20px_40px_-16px_rgb(242_195_87/0.45)] md:h-72 md:w-48">
        <span className="absolute inset-x-0 bottom-4 text-center text-sm font-black tracking-[-0.02em] text-ssr">SSR</span>
      </div>
    </div>
  );
}
