"use client";

import { useState, useSyncExternalStore } from "react";
import { NikkeImage } from "@/components/nikke-image";
import { rarityColor } from "@/components/title-wall";
import { type Nikke, nikkeImageUrl } from "@/data/nikkes";
import {
  type Banner,
  draw,
  isWishlistReady,
  JEWELS_PER_PULL,
  MILEAGE_COST,
  ratesFor,
  schedules,
  ssrPool,
} from "@/lib/gacha";
import { WishlistDialog } from "./wishlist-dialog";

type SsrRecord = { id: number; pull: number; source: "일반 모집" | "픽업 모집" | "마일리지 교환" };

type Stats = { pulls: number; jewels: number; mileage: number; ssr: SsrRecord[]; wishlist: number[] };

const emptyStats: Stats = { pulls: 0, jewels: 0, mileage: 0, ssr: [], wishlist: [] };

// TODO: Supabase 테이블이 생기면 로그인 사용자는 계정에 저장한다. 지금은 이 브라우저에만 남는다.
const STORAGE_KEY = "syuennote:gacha:v1";

function loadStats(): Stats {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...emptyStats, ...JSON.parse(saved) } : emptyStats;
  } catch {
    return emptyStats;
  }
}

// 서버 렌더에서는 빈 기록을 보여 주고, 브라우저에서 저장된 기록으로 바꾼다.
let cached: Stats | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getStats() {
  cached ??= loadStats();
  return cached;
}

function setStoredStats(next: Stats) {
  cached = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 사생활 보호 모드 등에서는 저장 없이 계속 쓴다.
  }
  listeners.forEach((listener) => listener());
}

const byId = new Map(ssrPool.map((nikke) => [nikke.id, nikke]));

// 처음 열면 지금 진행 중인 픽업 가운데 가장 최근 것을 고른다.
const today = new Date().toISOString().slice(0, 10);
const defaultSchedule = schedules.findLastIndex((schedule) => schedule.start <= today);
// 일반 모집은 시점을 고르지 않고 늘 지금 기준으로 돈다.
const normalSchedule = schedules[defaultSchedule];

// 픽업 고르기 목록. 최근 연도부터, 연도 안에서도 최근 픽업부터 보여 준다.
const scheduleYears = [...new Set(schedules.map((schedule) => schedule.start.slice(0, 4)))].reverse();

function scheduleLabel(index: number) {
  const schedule = schedules[index];
  const [, month, day] = schedule.start.split("-").map(Number);
  return `${month}월 ${day}일 ${byId.get(schedule.nikkeId)!.name}${schedule.limited ? " (한정)" : ""}`;
}

export function GachaSim() {
  const [kind, setKind] = useState<Banner["kind"]>("pickup");
  const [scheduleIndex, setScheduleIndex] = useState(defaultSchedule);
  const [result, setResult] = useState<{ key: number; cards: Nikke[] } | null>(null);
  const [wishlistDialog, setWishlistDialog] = useState<{ notice: boolean } | null>(null);
  const stats = useSyncExternalStore(subscribe, getStats, () => emptyStats);
  const update = setStoredStats;

  const schedule = schedules[scheduleIndex];
  const banner: Banner =
    kind === "normal" ? { kind, schedule: normalSchedule, wishlist: stats.wishlist } : { kind, schedule };
  const wishlistReady = isWishlistReady(stats.wishlist, normalSchedule);
  const pickupId = schedule.nikkeId;
  const pickup = byId.get(pickupId)!;

  function recruit(count: number) {
    if (kind === "normal" && !wishlistReady) {
      setWishlistDialog({ notice: true });
      return;
    }
    const cards = draw(banner, count);
    const source = kind === "pickup" ? "픽업 모집" : "일반 모집";
    const found = cards.flatMap((nikke, i) =>
      nikke.rarity === "SSR" ? [{ id: nikke.id, pull: stats.pulls + i + 1, source } as SsrRecord] : [],
    );
    update({
      ...stats,
      pulls: stats.pulls + count,
      jewels: stats.jewels + count * JEWELS_PER_PULL,
      mileage: stats.mileage + (kind === "pickup" ? count : 0),
      ssr: [...found.reverse(), ...stats.ssr],
    });
    setResult((prev) => ({ key: (prev?.key ?? 0) + 1, cards }));
  }

  function exchange() {
    update({
      ...stats,
      mileage: stats.mileage - MILEAGE_COST,
      ssr: [{ id: pickupId, pull: stats.pulls, source: "마일리지 교환" }, ...stats.ssr],
    });
    setResult((prev) => ({ key: (prev?.key ?? 0) + 1, cards: [pickup] }));
  }

  function reset() {
    if (!window.confirm("누적 기록을 모두 지울까요? 되돌릴 수 없습니다.")) return;
    update({ ...emptyStats, wishlist: stats.wishlist });
    setResult(null);
  }

  const table = ratesFor(banner);

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section aria-label="모집">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg bg-raise p-1" role="group" aria-label="모집 종류">
            {(["pickup", "normal"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={kind === value}
                onClick={() => setKind(value)}
                className="min-h-11 rounded-md px-4 text-sm font-extrabold text-ink-2 aria-pressed:bg-raise-2 aria-pressed:text-ink"
              >
                {value === "pickup" ? "픽업 모집" : "일반 모집"}
              </button>
            ))}
          </div>
          {kind === "pickup" && (
            <label className="flex items-center gap-2 text-sm font-bold text-ink-2">
              픽업
              <select
                value={scheduleIndex}
                onChange={(event) => setScheduleIndex(Number(event.target.value))}
                className="min-h-11 max-w-64 rounded-lg border border-line bg-raise px-3 text-ink"
              >
                {scheduleYears.map((year) => (
                  <optgroup key={year} label={`${year}년`}>
                    {schedules
                      .map((item, index) => ({ item, index }))
                      .filter(({ item }) => item.start.startsWith(year))
                      .reverse()
                      .map(({ index }) => (
                        <option key={index} value={index}>
                          {scheduleLabel(index)}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>
          )}
          {kind === "normal" && (
            <button
              type="button"
              onClick={() => setWishlistDialog({ notice: false })}
              className="min-h-11 rounded-lg border border-line px-4 text-sm font-extrabold hover:border-violet"
            >
              위시리스트 {wishlistReady ? "수정" : "지정"}
            </button>
          )}
        </div>

        <p className="mt-3 text-sm text-ink-2">
          {kind === "pickup" && <>픽업 {pickup.name} {table.pickup}%, </>}
          {table.pilgrim > 0 && <>{kind === "normal" && "위시리스트 "}오버스펙/필그림 {table.pilgrim}%, </>}
          {kind === "pickup" ? "그 외" : "위시리스트 통상"} SSR {table.otherSsr}%, SR {table.sr}%, R {table.r}%
        </p>
        {kind === "normal" && !wishlistReady && (
          <p className="mt-1 text-sm font-bold text-ssr">
            {stats.wishlist.length
              ? "위시리스트에 지금 고를 수 없는 니케가 있습니다. 위시리스트를 다시 지정해 주세요."
              : "일반 모집은 위시리스트 픽업으로 진행됩니다. 위시리스트를 먼저 지정해 주세요."}
          </p>
        )}

        {wishlistDialog && (
          <WishlistDialog
            notice={wishlistDialog.notice}
            schedule={normalSchedule}
            wishlist={stats.wishlist}
            onSave={(wishlist) => update({ ...stats, wishlist })}
            onClose={() => setWishlistDialog(null)}
          />
        )}

        <p aria-live="polite" className="sr-only">
          {result && summarize(result.cards)}
        </p>
        <div className="mt-5 min-h-56 rounded-xl bg-raise p-2 sm:p-3 md:p-5">
          {result ? (
            <ol key={result.key} className={`grid gap-2 md:gap-3 ${result.cards.length > 1 ? "grid-cols-5" : "w-32 md:w-44"}`}>
              {result.cards.map((nikke, i) => (
                <li key={i}>
                  <Card nikke={nikke} delay={i * 90} />
                </li>
              ))}
            </ol>
          ) : (
            <p className="grid h-50 place-items-center text-center text-ink-2">모집 버튼을 누르면 결과 카드가 여기 펼쳐집니다.</p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:flex">
          <RecruitButton label="1회 모집" jewels={JEWELS_PER_PULL} onClick={() => recruit(1)} />
          <RecruitButton primary label="10회 모집" jewels={JEWELS_PER_PULL * 10} onClick={() => recruit(10)} />
        </div>
      </section>

      <aside className="grid content-start gap-4">
        <div className="rounded-xl bg-raise p-5">
          <h2 className="font-extrabold">누적 기록</h2>
          <dl className="mt-3 grid grid-cols-3 gap-3">
            <Stat label="모집" value={`${stats.pulls.toLocaleString()}회`} />
            <Stat label="SSR" value={`${stats.ssr.length}명`} />
            <Stat label="소모 쥬얼" value={stats.jewels.toLocaleString()} />
          </dl>

          {kind === "pickup" && (
            <div className="mt-5">
              <p className="flex justify-between text-sm font-bold">
                <span>골드 마일리지</span>
                <span className="tabular-nums text-ink-2">
                  {stats.mileage} / {MILEAGE_COST}
                </span>
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-raise-2">
                <div className="h-full bg-ssr" style={{ width: `${Math.min(100, (stats.mileage / MILEAGE_COST) * 100)}%` }} />
              </div>
              <button
                type="button"
                disabled={stats.mileage < MILEAGE_COST}
                onClick={exchange}
                className="mt-3 min-h-11 w-full rounded-lg border border-ssr px-4 text-sm font-extrabold text-ssr disabled:border-line disabled:text-ink-2"
              >
                {pickup.name} 교환
              </button>
              <p className="mt-2 text-xs text-ink-2">픽업 모집 1회마다 1씩 쌓이고, 픽업 니케를 바꿔도 그대로 이어집니다. 교환하면 지금 고른 픽업 니케를 받습니다.</p>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-raise p-5">
          <h2 className="font-extrabold">SSR 획득 기록</h2>
          {stats.ssr.length ? (
            <ol className="mt-3 grid max-h-80 gap-1 overflow-y-auto">
              {stats.ssr.map((record, i) => (
                <li key={i} className="flex justify-between gap-3 border-b border-line py-2 text-sm last:border-0">
                  <span className="font-bold text-ssr">{byId.get(record.id)?.name ?? "알 수 없음"}</span>
                  <span className="shrink-0 text-ink-2">
                    {record.source === "마일리지 교환" ? record.source : `${record.pull}번째 ${record.source}`}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-sm text-ink-2">아직 뽑은 SSR이 없습니다.</p>
          )}
          <button type="button" onClick={reset} className="mt-2 -ml-3 min-h-11 px-3 text-sm font-bold text-ink-2 hover:text-ink">
            기록 초기화
          </button>
        </div>
      </aside>
    </div>
  );
}

function summarize(cards: Nikke[]) {
  const ssr = cards.filter((nikke) => nikke.rarity === "SSR").map((nikke) => nikke.name);
  const sr = cards.filter((nikke) => nikke.rarity === "SR").length;
  const r = cards.length - ssr.length - sr;
  return `${cards.length}명 모집 결과: ${ssr.length ? `SSR ${ssr.join(", ")}` : "SSR 없음"}, SR ${sr}명, R ${r}명`;
}

function RecruitButton({
  label,
  jewels,
  primary = false,
  onClick,
}: {
  label: string;
  jewels: number;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center rounded-lg px-6 py-3 transition-opacity hover:opacity-85 sm:min-w-40 ${
        primary ? "bg-ink text-ground" : "bg-raise-2 text-ink"
      }`}
    >
      <span className="text-base font-extrabold">{label}</span>
      <span className="text-xs font-bold opacity-75">쥬얼 {jewels.toLocaleString()}</span>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold text-ink-2">{label}</dt>
      <dd className="mt-0.5 text-lg font-black tracking-[-0.02em] tabular-nums">{value}</dd>
    </div>
  );
}

// 뒷면에서 앞면으로 뒤집힌다. SSR은 앞면이 드러날 때 금색 테두리와 빛이 붙는다.
function Card({ nikke, delay }: { nikke: Nikke; delay: number }) {
  const ssr = nikke.rarity === "SSR";
  return (
    <div className="gacha-card aspect-[2/3]" style={{ animationDelay: `${delay}ms` }}>
      <div className={`gacha-face relative overflow-hidden rounded-lg bg-raise-2 ${ssr ? "is-ssr" : ""}`}>
        <NikkeImage
          src={nikkeImageUrl(nikke)}
          alt=""
          className="absolute inset-0 size-full object-cover"
          fallback={
            <span
              aria-hidden="true"
              className="absolute inset-x-1 top-5 text-xl leading-none font-black tracking-[-0.04em] text-raise md:inset-x-2 md:top-8 md:text-4xl"
            >
              {nikke.name}
            </span>
          }
        />
        <span
          className={`absolute top-1 left-1 rounded bg-ground/95 px-1 text-[10px] font-black md:top-2 md:left-2 md:text-xs ${rarityColor[nikke.rarity]}`}
        >
          {nikke.rarity}
        </span>
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ground to-transparent px-1 pt-6 pb-1 text-[10px] leading-tight font-bold md:px-2 md:pb-2 md:text-sm">
          <span className="line-clamp-2">{nikke.name}</span>
        </span>
      </div>
      <div aria-hidden="true" className="gacha-back rounded-lg border border-line bg-[linear-gradient(160deg,#3a2560,#1d1629)]" />
    </div>
  );
}
