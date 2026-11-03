import Link from "next/link";
import type { ReactNode } from "react";
import { NikkeImage } from "./nikke-image";

export function Row({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-[1400px] px-4 pt-8 md:px-10">
      <div className="mb-1 flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-extrabold tracking-[-0.02em] md:text-xl">{title}</h2>
        {action}
      </div>
      {/* 줄은 헤더와 같은 본문 폭 안에서만 스크롤된다. 안쪽 여백 2는 가장자리 타일이 커질 때 잘리지 않게 둔 자리다. */}
      <div className="rail -mx-2 flex scroll-px-2 gap-3 overflow-x-auto px-2 pt-3 pb-5">{children}</div>
    </section>
  );
}

export const rarityColor = { SSR: "text-ssr", SR: "text-sr", R: "text-r" } as const;

export function Tile({
  href,
  name,
  rarity,
  detail,
  image,
  wide = false,
  fluid = false,
}: {
  href: string;
  name: string;
  rarity?: keyof typeof rarityColor;
  detail: string;
  image?: string;
  wide?: boolean;
  // 격자 안에서 칸 너비를 그대로 채운다.
  fluid?: boolean;
}) {
  // 이미지가 없거나 불러오지 못한 타일은 이름이 그림 역할을 한다.
  const nameArt = (
    <span
      aria-hidden="true"
      className="absolute inset-x-2 top-8 text-[2.75rem] leading-none font-black tracking-[-0.04em] text-raise-2 md:text-6xl"
    >
      {name}
    </span>
  );

  return (
    <Link
      href={href}
      className={`tile relative flex min-w-0 shrink-0 snap-start flex-col justify-end overflow-hidden rounded-lg bg-raise p-3 ${
        wide ? "aspect-[16/10] w-64 md:w-80" : fluid ? "aspect-[2/3] w-full" : "aspect-[2/3] w-32 md:w-44"
      }`}
    >
      {image ? (
        <>
          <NikkeImage
            lazy
            src={image}
            alt=""
            fallback={nameArt}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <span
            aria-hidden="true"
            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-ground/90 to-transparent ${fluid ? "h-2/3" : "h-1/2"}`}
          />
        </>
      ) : (
        nameArt
      )}
      {/* 이미지의 밝은 부분 위에서도 등급 색이 읽히도록 어두운 바탕을 깐다. */}
      {rarity && (
        <span className={`absolute top-2 left-2 rounded bg-ground/95 px-1.5 py-0.5 text-xs font-black ${rarityColor[rarity]}`}>
          {rarity}
        </span>
      )}
      <span className={`relative font-extrabold ${fluid ? "text-sm leading-snug md:text-[15px]" : ""}`}>{name}</span>
      <span className="tile-detail relative text-xs text-ink-2">{detail}</span>
    </Link>
  );
}
