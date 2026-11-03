import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NikkeImage } from "@/components/nikke-image";
import { Row, Tile, rarityColor } from "@/components/title-wall";
import { nikkeImageUrl, nikkes } from "@/data/nikkes";
import { type FilterKey, dexHref, optionLabel } from "../filters";

export function generateStaticParams() {
  return nikkes.map((nikke) => ({ id: String(nikke.id) }));
}

function findNikke(id: string) {
  return nikkes.find((nikke) => String(nikke.id) === id);
}

export async function generateMetadata({ params }: PageProps<"/dex/[id]">): Promise<Metadata> {
  const nikke = findNikke((await params).id);
  if (!nikke) return {};
  return {
    title: nikke.name,
    description: `${nikke.name}: ${nikke.rarity} ${nikke.manufacturer} ${nikke.class}, 버스트 ${nikke.burst}, ${nikke.element} 속성, ${nikke.weapon}.`,
  };
}

export default function NikkePage({ params }: PageProps<"/dex/[id]">) {
  return (
    <main>
      <div className="mx-auto max-w-[1400px] px-4 pt-6 md:px-10 md:pt-10">
        <Link href="/dex" className="-my-3 inline-block py-3.5 text-sm font-bold text-ink-2 hover:text-ink">
          도감으로
        </Link>
      </div>
      {/* 다른 니케 상세에서 넘어올 때도 바로 그려지도록 주소의 id를 읽는 부분만 Suspense로 감싼다. */}
      <Suspense fallback={<DetailSkeleton />}>
        <NikkeDetail params={params} />
      </Suspense>
    </main>
  );
}

const detailGrid = "mt-4 grid items-start gap-8 md:grid-cols-[minmax(0,380px)_1fr] md:gap-14";
const imageFrame = "relative mx-auto aspect-[2/3] w-full max-w-[220px] overflow-hidden rounded-xl bg-raise md:max-w-none";

function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="니케 정보를 불러오는 중" className="mx-auto max-w-[1400px] px-4 md:px-10">
      <div className={detailGrid}>
        <div className={imageFrame} />
        <div className="md:pt-6">
          <div className="h-5 w-10 rounded bg-raise" />
          <div className="mt-2 h-12 w-3/4 rounded-lg bg-raise md:h-16" />
        </div>
      </div>
    </div>
  );
}

async function NikkeDetail({ params }: { params: PageProps<"/dex/[id]">["params"] }) {
  const nikke = findNikke((await params).id);
  if (!nikke) notFound();

  const specs: { key: FilterKey; label: string; value: string }[] = [
    { key: "maker", label: "제조사", value: nikke.manufacturer },
    { key: "class", label: "클래스", value: nikke.class },
    { key: "burst", label: "버스트", value: nikke.burst },
    { key: "element", label: "속성", value: nikke.element },
    { key: "weapon", label: "무기", value: nikke.weapon },
  ];
  const siblings = nikkes.filter((other) => other.manufacturer === nikke.manufacturer && other.id !== nikke.id);

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-4 md:px-10">
        <div className={detailGrid}>
          <div className={imageFrame}>
            <NikkeImage
              src={nikkeImageUrl(nikke)}
              alt={nikke.name}
              className="h-full w-full object-cover object-top"
              fallback={
                <span
                  aria-hidden="true"
                  className="absolute inset-x-4 top-10 text-6xl leading-none font-black tracking-[-0.04em] text-raise-2 md:text-8xl"
                >
                  {nikke.name}
                </span>
              }
            />
          </div>
          <div className="md:pt-6">
            <p className={`text-sm font-black ${rarityColor[nikke.rarity]}`}>{nikke.rarity}</p>
            <h1 className="mt-1 text-[2.5rem] leading-[1.05] font-black tracking-[-0.035em] md:text-[4rem]">{nikke.name}</h1>
            <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
              {specs.map((spec) => (
                <div key={spec.key} className="relative rounded-xl bg-raise p-4 outline-offset-3 transition-colors hover:bg-raise-2 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-violet">
                  <dt className="text-sm font-bold text-ink-2">{spec.label}</dt>
                  <dd className="mt-1 text-lg font-extrabold">
                    {/* 칸 전체가 눌리도록 링크를 칸 크기로 넓히고, 포커스 테두리도 칸에 그린다. */}
                    <Link
                      href={dexHref(spec.key, spec.value)}
                      aria-label={`${spec.label} ${optionLabel(spec.key, spec.value)} 니케 모두 보기`}
                      className="outline-none after:absolute after:inset-0 after:rounded-xl"
                    >
                      {optionLabel(spec.key, spec.value)}
                    </Link>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-ink-2">항목을 누르면 같은 조건의 니케를 도감에서 모아 봅니다.</p>
          </div>
        </div>
      </div>
      {siblings.length > 0 && (
        <Row
          title={`${nikke.manufacturer}의 다른 니케`}
          action={
            <Link
              href={dexHref("maker", nikke.manufacturer)}
              className="-my-3 shrink-0 py-3 text-sm font-bold text-ink-2 hover:text-ink"
            >
              도감에서 보기
            </Link>
          }
        >
          {siblings.map((other) => (
            <Tile
              key={other.id}
              href={`/dex/${other.id}`}
              name={other.name}
              rarity={other.rarity}
              detail={`${other.class} · ${other.weapon} · 버스트 ${other.burst}`}
              image={nikkeImageUrl(other)}
            />
          ))}
        </Row>
      )}
    </>
  );
}
