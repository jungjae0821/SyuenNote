"use client";

import { useState, useSyncExternalStore } from "react";
import { NikkeImage } from "@/components/nikke-image";
import { rarityColor } from "@/components/title-wall";
import { wornImageUrl } from "@/data/costumes";
import { manufacturers, type Nikke, nikkes } from "@/data/nikkes";
import type { OwnedCharacter } from "@/lib/blablalink";
import { BlablalinkImport, type Player } from "./blablalink-import";

type GameData = { player: Player | null; owned: number[] };

const emptyGame: GameData = { player: null, owned: [] };

// TODO: Supabase 테이블이 생기면 로그인 사용자는 계정에 저장한다. 지금은 이 브라우저에만 남는다.
// v1은 직접 입력하던 지휘관 정보가 있던 형식이다. 보유 니케만 이어받는다.
// v2 안의 profile은 예전에 불러온 것이면 characters·team이 없다. 빈 목록으로 채워 읽는다.
const STORAGE_KEY = "syuennote:me:v2";
const LEGACY_KEY = "syuennote:me:v1";

function loadGame(): GameData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!saved) return emptyGame;
    const parsed = JSON.parse(saved) as Partial<GameData>;
    const player = parsed.player?.profile
      ? {
          ...parsed.player,
          profile: {
            ...parsed.player.profile,
            characters: parsed.player.profile.characters ?? [],
            team: parsed.player.profile.team ?? [],
          },
        }
      : (parsed.player ?? null);
    return { player, owned: parsed.owned ?? [] };
  } catch {
    return emptyGame;
  }
}

// 서버 렌더에서는 빈 정보를 보여 주고, 브라우저에서 저장된 정보로 바꾼다.
let cached: GameData | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getGame() {
  cached ??= loadGame();
  return cached;
}

function setStoredGame(next: GameData) {
  cached = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 사생활 보호 모드 등에서는 저장 없이 계속 쓴다.
  }
  listeners.forEach((listener) => listener());
}

const rarities = ["SSR", "SR", "R"] as const;
const ownedFilters = ["전체", "보유", "미보유"] as const;
const sorts = ["도감순", "전투력순"] as const;

// 한계 돌파 최대 횟수. SSR은 3돌파 뒤 코어 강화(최대 7)로 이어진다.
const maxGrade = { SSR: 3, SR: 2, R: 0 } as const;
const MAX_CORE = 7;

// 띄어쓰기와 대소문자를 무시한다. 도감 검색과 같은 규칙.
function normalize(text: string) {
  return text.replace(/\s+/g, "").toLowerCase();
}

export function MyGame() {
  const game = useSyncExternalStore(subscribe, getGame, () => emptyGame);

  return (
    <>
      <BlablalinkImport
        player={game.player}
        onPlayer={(player) =>
          // 불러온 보유 니케로 체크리스트를 바꾼다. 연결을 해제할 때는 체크리스트를 그대로 둔다.
          setStoredGame({ ...getGame(), player, ...(player && { owned: player.profile.owned }) })
        }
      />
      <Collection owned={game.owned} />
      <OwnedNikkes
        owned={game.owned}
        characters={game.player?.profile.characters ?? []}
        locked={Boolean(game.player?.profile)}
        onChange={(update) => setStoredGame({ ...getGame(), owned: update(getGame().owned) })}
      />
    </>
  );
}

// 연달아 누를 때 앞선 변경을 덮어쓰지 않도록, 렌더 시점 값이 아니라 저장된 최신 값에서 바꾼다.
function OwnedNikkes({
  owned,
  characters,
  locked,
  onChange,
}: {
  owned: number[];
  characters: OwnedCharacter[];
  locked: boolean;
  onChange: (update: (owned: number[]) => number[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState<(typeof rarities)[number] | null>(null);
  const [ownedFilter, setOwnedFilter] = useState<(typeof ownedFilters)[number]>("전체");
  const [sort, setSort] = useState<(typeof sorts)[number]>("전투력순");

  const ownedSet = new Set(owned);
  const needle = normalize(query);
  const visible = nikkes.filter(
    (nikke) =>
      normalize(nikke.name).includes(needle) &&
      (!rarity || nikke.rarity === rarity) &&
      (ownedFilter === "전체" || (ownedFilter === "보유") === ownedSet.has(nikke.id)),
  );
  // 육성 상태는 불러온 기록에만 있다. 직접 체크한 니케는 상태 없이 보유로만 보인다.
  const growth = new Map(characters.filter((item) => ownedSet.has(item.id)).map((item) => [item.id, item]));
  if (sort === "전투력순") visible.sort((a, b) => (growth.get(b.id)?.combat ?? -1) - (growth.get(a.id)?.combat ?? -1));
  const grown = nikkes.flatMap((nikke) => {
    const item = growth.get(nikke.id);
    return item ? [{ nikke, item }] : [];
  });
  const fullGrade = grown.filter(({ nikke, item }) => maxGrade[nikke.rarity] > 0 && item.grade >= maxGrade[nikke.rarity]).length;
  const fullCore = grown.filter(({ nikke, item }) => nikke.rarity === "SSR" && item.core >= MAX_CORE).length;
  const allVisibleOwned = visible.length > 0 && visible.every((nikke) => ownedSet.has(nikke.id));

  function toggle(id: number) {
    onChange((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleVisible() {
    const ids = new Set(visible.map((nikke) => nikke.id));
    onChange((current) => (allVisibleOwned ? current.filter((id) => !ids.has(id)) : [...new Set([...current, ...ids])]));
  }

  return (
    <section aria-labelledby="owned-title" className="rounded-xl bg-raise p-5 md:col-span-2">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h2 id="owned-title" className="text-lg font-extrabold">
            보유 니케
          </h2>
          <p className="mt-1 text-sm text-ink-2">
            {locked
              ? "blablalink에서 불러온 보유 목록입니다. 바뀌었다면 위에서 다시 불러오세요."
              : "가진 니케를 눌러 표시합니다. 다시 누르면 해제됩니다."}
          </p>
        </div>
        <dl className="flex gap-5 text-sm">
          <div>
            <dt className="font-bold text-ink-2">전체</dt>
            <dd className="text-lg font-black tabular-nums">
              {ownedSet.size}
              <span className="text-sm font-bold text-ink-2"> / {nikkes.length}</span>
            </dd>
          </div>
          {rarities.map((value) => (
            <div key={value}>
              <dt className={`font-black ${rarityColor[value]}`}>{value}</dt>
              <dd className="text-lg font-black tabular-nums">
                {nikkes.filter((nikke) => nikke.rarity === value && ownedSet.has(nikke.id)).length}
                <span className="text-sm font-bold text-ink-2">
                  {" "}
                  / {nikkes.filter((nikke) => nikke.rarity === value).length}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="min-w-0 flex-1 basis-56 md:max-w-xs">
          <span className="sr-only">니케 이름 검색</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="이름으로 찾기"
            className="h-11 w-full rounded-lg bg-raise-2 px-3.5 text-base placeholder:text-ink-2"
          />
        </label>
        <ChipGroup
          label="등급"
          options={["전체", ...rarities]}
          value={rarity ?? "전체"}
          onChange={(value) => setRarity(value === "전체" ? null : (value as (typeof rarities)[number]))}
        />
        <ChipGroup
          label="보유 여부"
          options={ownedFilters}
          value={ownedFilter}
          onChange={(value) => setOwnedFilter(value as (typeof ownedFilters)[number])}
        />
        {growth.size > 0 && (
          <ChipGroup label="정렬" options={sorts} value={sort} onChange={(value) => setSort(value as (typeof sorts)[number])} />
        )}
      </div>

      {growth.size > 0 && (
        <p className="mt-3 text-sm text-ink-2">
          불러온 육성 상태 기준 <b className="text-ink">풀돌 {fullGrade}명</b> ·{" "}
          <b className="text-ink">코어 최대 {fullCore}명</b>
        </p>
      )}

      <div className="mt-4 flex min-h-11 items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm font-bold text-ink-2">
          {visible.length}명 표시
        </p>
        {!locked && visible.length > 0 && (
          <button type="button" onClick={toggleVisible} className="-mr-2 min-h-11 px-2 text-sm font-bold text-violet hover:text-ink">
            {allVisibleOwned ? "표시된 니케 모두 해제" : "표시된 니케 모두 보유"}
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
          {visible.map((nikke) => (
            <li key={nikke.id}>
              <OwnedTile
                nikke={nikke}
                on={ownedSet.has(nikke.id)}
                growth={growth.get(nikke.id)}
                onToggle={locked ? undefined : () => toggle(nikke.id)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 rounded-lg bg-raise-2 p-5 text-ink-2">조건에 맞는 니케가 없습니다.</p>
      )}
    </section>
  );
}

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded-lg bg-raise-2 p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className="min-h-9 rounded-md px-3 text-sm font-bold text-ink-2 hover:text-ink aria-pressed:bg-ink aria-pressed:text-ground"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function OwnedTile({
  nikke,
  on,
  growth,
  onToggle,
}: {
  nikke: Nikke;
  on: boolean;
  growth?: OwnedCharacter;
  // 없으면 게임에서 불러온 목록이라 눌러도 바뀌지 않는다.
  onToggle?: () => void;
}) {
  const Tag = onToggle ? "button" : "div";
  return (
    <Tag
      {...(onToggle && { type: "button" as const, "aria-pressed": on, onClick: onToggle })}
      className={`relative block aspect-[2/3] w-full overflow-hidden rounded-lg bg-raise-2 text-left outline-offset-2 ${on ? "ring-2 ring-violet" : ""}`}
    >
      <NikkeImage
        lazy
        src={wornImageUrl(nikke, growth?.costume)}
        alt=""
        className={`absolute inset-0 size-full object-cover transition-opacity ${on ? "" : "opacity-35 grayscale"}`}
        fallback={
          <span
            aria-hidden="true"
            className="absolute inset-x-1 top-3 text-lg leading-none font-black tracking-[-0.04em] text-raise"
          >
            {nikke.name}
          </span>
        }
      />
      <span className={`absolute top-1 left-1 rounded bg-ground/95 px-1 text-[10px] font-black ${rarityColor[nikke.rarity]}`}>
        {nikke.rarity}
      </span>
      {on && (
        <span className="absolute top-1 right-1 rounded bg-violet px-1 text-[10px] font-black text-ground">보유</span>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ground to-transparent px-1 pt-5 pb-1 text-[11px] leading-tight font-bold text-ink md:text-xs">
        {growth && <GrowthBadge nikke={nikke} growth={growth} />}
        <span className="line-clamp-2">{nikke.name}</span>
      </span>
    </Tag>
  );
}

// 돌파는 별, 코어는 +n으로 보인다. 화면 읽기 프로그램에는 글로 읽힌다.
function GrowthBadge({ nikke, growth }: { nikke: Nikke; growth: OwnedCharacter }) {
  const max = maxGrade[nikke.rarity];
  const grade = Math.min(growth.grade, max);
  const label = [
    max > 0 && `${grade}돌파`,
    growth.core > 0 && `코어 ${growth.core}`,
    growth.combat > 0 && `전투력 ${growth.combat.toLocaleString("ko-KR")}`,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <span className="mb-0.5 flex items-center gap-1 text-[10px] leading-none font-black">
      <span className="sr-only">{label}</span>
      {max > 0 && (
        <span aria-hidden="true" className="tracking-[-0.1em] text-ssr">
          {"★".repeat(grade)}
          <span className="text-ink-2/60">{"★".repeat(max - grade)}</span>
        </span>
      )}
      {growth.core > 0 && (
        <span aria-hidden="true" className={growth.core >= MAX_CORE ? "text-violet" : "text-ink"}>
          +{growth.core}
        </span>
      )}
    </span>
  );
}

const collectionGroups = [
  { title: "제조사", key: "manufacturer", values: manufacturers },
  { title: "클래스", key: "class", values: ["화력형", "방어형", "지원형"] },
  { title: "버스트", key: "burst", values: ["I", "II", "III", "전체"] },
] as const satisfies readonly { title: string; key: keyof Nikke; values: readonly string[] }[];

// 도감과 보유 목록만으로 계산한다. 새로 불러오는 값은 없다.
function Collection({ owned }: { owned: number[] }) {
  const ownedSet = new Set(owned);
  return (
    <section aria-labelledby="collection-title" className="rounded-xl bg-raise p-5 md:col-span-2">
      <h2 id="collection-title" className="text-lg font-extrabold">
        컬렉션 달성률
      </h2>
      <div className="mt-4 grid gap-x-8 gap-y-6 md:grid-cols-3">
        {collectionGroups.map((group) => (
          <div key={group.key}>
            <h3 className="text-sm font-bold text-ink-2">{group.title}</h3>
            <ul className="mt-2 grid gap-2.5">
              {group.values.map((value) => {
                const all = nikkes.filter((nikke) => nikke[group.key] === value);
                const have = all.filter((nikke) => ownedSet.has(nikke.id)).length;
                const percent = all.length ? Math.round((have / all.length) * 100) : 0;
                const name = group.key === "burst" ? (value === "전체" ? "버스트 전환" : `버스트 ${value}`) : value;
                return (
                  <li key={value}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-bold">{name}</span>
                      <span className="font-black tabular-nums">
                        {have}
                        <span className="font-bold text-ink-2"> / {all.length}</span>
                      </span>
                    </div>
                    <div
                      role="meter"
                      aria-label={`${name} 보유율`}
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="mt-1 h-1.5 overflow-hidden rounded-full bg-raise-2"
                    >
                      <div className="h-full rounded-full bg-violet" style={{ width: `${percent}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
