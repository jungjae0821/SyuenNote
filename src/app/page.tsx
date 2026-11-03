import Link from "next/link";
import type { ReactNode } from "react";
import { HeroCarousel } from "@/components/hero-carousel";
import { NikkeImage } from "@/components/nikke-image";
import { Row, Tile } from "@/components/title-wall";
import { manufacturers, type Nikke, nikkeImageUrl, nikkes } from "@/data/nikkes";
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

const heroLabels = ["니케 도감", "가챠 시뮬레이터", "이름 맞추기 퀴즈", "내 정보"];

function Hero() {
  const pick = (...ids: number[]) => ids.map((id) => nikkes.find((nikke) => nikke.id === id)).filter((nikke) => nikke !== undefined);

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(110%_90%_at_78%_20%,#3d2468_0%,#1b1328_55%,var(--ground)_100%)]">
      <h1 className="sr-only">슈엔노트</h1>
      <HeroCarousel
        labels={heroLabels}
        slides={[
          <Slide
            key="dex"
            title="니케 도감"
            body={`플레이어블 니케 ${nikkes.length}명을 제조사, 클래스, 버스트, 속성, 무기로 걸러 찾아봅니다.`}
            tags={manufacturers}
            href="/dex"
            cta="도감 보기"
            visual={<Fan nikkes={pick(110301, 110401, 110501)} />}
          />,
          <Slide
            key="gacha"
            title="가챠 시뮬레이터"
            body="일반 모집과 픽업 모집을 실제 확률대로 뽑아 봅니다. 뽑은 SSR과 소모 쥬얼은 누적 기록으로 남습니다."
            tags={["SSR 4%", "통상 픽업 2%", "오버스펙/필그림 1%", "200회 마일리지 교환"]}
            highlight
            href="/gacha"
            cta="모집하러 가기"
            visual={<Fan nikkes={pick(301701, 401901, 101801)} ssr />}
          />,
          <Slide
            key="quiz"
            title="이름 맞추기 퀴즈"
            body="실루엣이나 일러스트 일부만 보고 니케 이름을 맞혀 봅니다."
            tags={["실루엣", "일러스트"]}
            href="/quiz"
            cta="퀴즈 풀기"
            visual={<Silhouette nikke={pick(110401)[0]} />}
          />,
          <Slide
            key="me"
            title="내 정보"
            body="blablalink 게임 정보를 불러와 보유 니케의 육성 상태, 대표 스쿼드, 컬렉션 달성률을 한눈에 봅니다."
            tags={["육성 상태", "대표 스쿼드", "컬렉션 달성률"]}
            href="/me"
            cta="내 정보 보기"
            visual={<Squad nikkes={pick(201601, 360001, 301701, 360101, 101801)} />}
          />,
        ]}
      />
    </section>
  );
}

function Slide({
  title,
  body,
  tags,
  highlight = false,
  href,
  cta,
  visual,
}: {
  title: string;
  body: string;
  tags: readonly string[];
  // 첫 태그를 금색으로 강조한다.
  highlight?: boolean;
  href: string;
  cta: string;
  visual: ReactNode;
}) {
  return (
    <div className="mx-auto grid h-full max-w-[1400px] items-end gap-10 px-4 pt-12 pb-16 md:grid-cols-[1fr_auto] md:px-10 md:pt-20 md:pb-20">
      <div>
        <h2 className="max-w-[12ch] text-[2.5rem] leading-[1.05] font-black tracking-[-0.035em] md:text-[4rem]">{title}</h2>
        <p className="mt-3 max-w-[38ch] text-base text-ink-2 md:text-lg">{body}</p>
        <ul className="mt-4 flex flex-wrap gap-2 text-xs font-extrabold">
          {tags.map((tag, i) => (
            <li key={tag} className={`rounded-md px-2 py-1 ${highlight && i === 0 ? "bg-ssr text-ground" : "bg-white/10"}`}>
              {tag}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={href}
            className="rounded-lg bg-ink px-5 py-3 text-base font-extrabold text-ground transition-opacity hover:opacity-85"
          >
            {cta}
          </Link>
        </div>
      </div>
      {visual}
    </div>
  );
}

// 카드 세 장을 부채꼴로 펼친다. nikkes는 왼쪽, 가운데, 오른쪽 순서이고 가운데 장이 맨 위에 온다.
// ssr이면 가운데 장을 모집 결과처럼 금색 테두리로 빛낸다.
function Fan({ nikkes, ssr = false }: { nikkes: Nikke[]; ssr?: boolean }) {
  const [left, center, right] = nikkes;
  const cards = [
    { nikke: left, place: "top-6 left-2 -rotate-12 h-44 w-32 border border-line md:h-64 md:w-44" },
    { nikke: right, place: "top-2 right-2 rotate-12 h-44 w-32 border border-line md:h-64 md:w-44" },
    {
      nikke: center,
      place: `top-0 left-1/2 -translate-x-1/2 h-48 w-34 md:h-72 md:w-48 ${
        ssr
          ? "border-2 border-ssr shadow-[0_20px_40px_-16px_rgb(242_195_87/0.45)]"
          : "border border-line shadow-[0_20px_40px_-16px_rgb(0_0_0/0.6)]"
      }`,
    },
  ];
  return (
    <div aria-hidden="true" className="relative mx-auto h-56 w-60 md:mr-16 md:h-80 md:w-80">
      {cards.map(
        ({ nikke, place }) =>
          nikke && (
            <div key={nikke.id} className={`absolute overflow-hidden rounded-xl bg-raise ${place}`}>
              <NikkeImage src={nikkeImageUrl(nikke)} alt="" className="h-full w-full object-cover" fallback={null} />
            </div>
          ),
      )}
    </div>
  );
}

// 퀴즈 실루엣. 이미지를 검게 칠하고 물음표를 올린다.
function Silhouette({ nikke }: { nikke?: Nikke }) {
  return (
    <div aria-hidden="true" className="relative mx-auto h-56 w-60 md:mr-16 md:h-80 md:w-80">
      <div className="absolute top-0 left-1/2 h-48 w-34 -translate-x-1/2 overflow-hidden rounded-xl border-2 border-violet bg-raise md:h-72 md:w-48">
        {/* 검은 실루엣이 바탕에 묻히지 않게 뒤를 밝힌다. 퀴즈 화면과 같은 처리. */}
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_35%,#4a3570,transparent)]" />
        {nikke && (
          <NikkeImage src={nikkeImageUrl(nikke)} alt="" className="relative h-full w-full object-cover object-top brightness-0" fallback={null} />
        )}
        <span className="absolute inset-x-0 bottom-3 text-center text-4xl font-black text-violet md:text-5xl">?</span>
      </div>
    </div>
  );
}

// 대표 스쿼드 다섯 명과 컬렉션 달성률 막대.
function Squad({ nikkes }: { nikkes: Nikke[] }) {
  return (
    <div aria-hidden="true" className="mx-auto w-72 rounded-xl border border-line bg-raise p-4 md:mr-16 md:w-96 md:p-5">
      <p className="text-xs font-extrabold text-ink-2">대표 스쿼드</p>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {nikkes.map((nikke) => (
          <div key={nikke.id} className="aspect-[2/3] overflow-hidden rounded-md bg-raise-2">
            <NikkeImage src={nikkeImageUrl(nikke)} alt="" className="h-full w-full object-cover" fallback={null} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-baseline justify-between text-xs font-extrabold">
        <span className="text-ink-2">컬렉션 달성률</span>
        <span>72%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-raise-2">
        <div className="h-full w-[72%] rounded-full bg-violet" />
      </div>
    </div>
  );
}
