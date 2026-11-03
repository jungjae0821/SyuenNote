import Link from "next/link";
import type { ReactNode } from "react";
import { connection } from "next/server";
import { type PickupBanner, pickupBanners } from "@/data/banners";
import { storyEvents } from "@/data/events";
import { type Nikke, nikkeImageUrl, nikkes } from "@/data/nikkes";
import { NikkeImage } from "./nikke-image";

const byId = new Map(nikkes.map((nikke) => [nikke.id, nikke]));

// 일정 날짜는 한국 서버 기준이라 오늘 날짜도 한국 시간으로 잡는다.
function todayInKorea() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

function monthDay(date: string) {
  const [, month, day] = date.split("-").map(Number);
  return `${month}월 ${day}일`;
}

// 종료일은 그날까지 열려 있는 마지막 날이다.
function endsIn(today: string, end: string) {
  const days = daysBetween(today, end);
  return days === 0 ? "오늘 종료" : `${days}일 남음`;
}

function startsIn(today: string, start: string) {
  const days = daysBetween(today, start);
  return days === 1 ? "내일 시작" : `${days}일 뒤 시작`;
}

// 진행 중인 픽업, 다음 픽업, 진행 중인 스토리 이벤트. 날짜가 요청마다 달라지므로 요청 시점에 그린다.
export async function NowBoard() {
  await connection();
  const today = todayInKorea();

  const current = pickupBanners.filter((banner) => banner.start <= today && today <= banner.end);
  const nextStart = pickupBanners.find((banner) => banner.start > today)?.start;
  const upcoming = pickupBanners.filter((banner) => banner.start === nextStart);
  const events = storyEvents.filter((event) => event.start <= today && today <= event.end);

  return (
    <div className="mx-auto grid max-w-[1400px] gap-8 px-4 pt-8 pb-4 md:px-10">
      {/* 진행 중인 픽업과 다음 픽업은 나란히 두고, 스토리 이벤트는 그 아래에 둔다. */}
      <div className="grid gap-8 md:grid-cols-2">
        <Group title="진행 중인 픽업" empty="지금 열린 픽업이 없습니다.">
          {current.map((banner) => (
            <PickupCard key={`${banner.start}-${banner.nikkeId}`} banner={banner} when={`${monthDay(banner.end)}까지`} left={endsIn(today, banner.end)} />
          ))}
        </Group>

        <Group title="다음 픽업" empty="아직 발표된 다음 픽업이 없습니다.">
          {upcoming.map((banner) => (
            <PickupCard
              key={`${banner.start}-${banner.nikkeId}`}
              banner={banner}
              when={`${monthDay(banner.start)} ~ ${monthDay(banner.end)}`}
              left={startsIn(today, banner.start)}
            />
          ))}
        </Group>
      </div>

      {events.length > 0 && (
        <Group title="진행 중인 스토리 이벤트" columns="md:grid-cols-2 md:gap-x-8">
          {events.map((event) => (
            <li key={event.title} className="rounded-xl bg-raise p-4">
              <p className="text-xs font-extrabold text-ink-2">{event.kind}</p>
              <p className="mt-1 text-xl font-black tracking-[-0.02em]">{event.title}</p>
              <p className="mt-1 text-sm text-ink-2">
                {monthDay(event.start)} ~ {monthDay(event.end)}
              </p>
              <p className="mt-3 text-sm font-extrabold text-violet">{endsIn(today, event.end)}</p>
              {event.nikkeIds.length > 0 && (
                <p className="mt-3 text-sm">
                  <span className="text-ink-2">픽업 </span>
                  {event.nikkeIds.map((id) => byId.get(id)?.name).filter(Boolean).join(", ")}
                </p>
              )}
            </li>
          ))}
        </Group>
      )}
    </div>
  );
}

export function NowBoardSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto grid max-w-[1400px] gap-8 px-4 pt-8 pb-4 md:grid-cols-2 md:px-10">
      {[0, 1].map((i) => (
        <div key={i}>
          <div className="h-6 w-32 rounded bg-raise" />
          <div className="mt-3 h-36 rounded-xl bg-raise" />
        </div>
      ))}
    </div>
  );
}

// columns를 주지 않으면 넓은 화면에서 카드를 두 장씩 놓는다. 이벤트 줄은 위 픽업 두 칸과 열을 맞춘다.
function Group({
  title,
  empty,
  columns = "xl:grid-cols-2",
  children,
}: {
  title: string;
  empty?: string;
  columns?: string;
  children: ReactNode[];
}) {
  return (
    <section>
      <h2 className="text-lg font-extrabold tracking-[-0.02em] md:text-xl">{title}</h2>
      {children.length ? (
        <ul className={`mt-3 grid gap-3 ${columns}`}>{children}</ul>
      ) : (
        <p className="mt-2 text-sm text-ink-2">{empty}</p>
      )}
    </section>
  );
}

function PickupCard({ banner, when, left }: { banner: PickupBanner; when: string; left: string }) {
  const nikke: Nikke | undefined = byId.get(banner.nikkeId);
  if (!nikke) return null;
  return (
    <li>
      <Link href={`/dex/${nikke.id}`} className="flex gap-4 rounded-xl bg-raise p-3 hover:bg-raise-2">
        <div className="aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-lg bg-raise-2 md:w-24">
          <NikkeImage src={nikkeImageUrl(nikke)} alt="" className="h-full w-full object-cover object-top" fallback={null} />
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <p className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
            <span className="text-ssr">{nikke.rarity}</span>
            {banner.limited && <span className="rounded bg-white/10 px-1.5 py-0.5">한정</span>}
          </p>
          <p className="mt-1 font-extrabold leading-snug">{nikke.name}</p>
          <p className="mt-0.5 text-xs text-ink-2">
            {nikke.manufacturer} · {nikke.class} · 버스트 {nikke.burst}
          </p>
          <p className="mt-3 text-sm">
            <span className="font-extrabold text-violet">{left}</span>
            <span className="text-ink-2"> · {when}</span>
          </p>
        </div>
      </Link>
    </li>
  );
}
