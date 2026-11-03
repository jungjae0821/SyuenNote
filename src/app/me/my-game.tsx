"use client";

import { useState, useSyncExternalStore } from "react";
import { NikkeImage } from "@/components/nikke-image";
import { rarityColor } from "@/components/title-wall";
import { type Nikke, nikkeImageUrl, nikkes } from "@/data/nikkes";
import { BlablalinkImport, type Player } from "./blablalink-import";

type GameData = { player: Player | null; owned: number[] };

const emptyGame: GameData = { player: null, owned: [] };

// TODO: Supabase 테이블이 생기면 로그인 사용자는 계정에 저장한다. 지금은 이 브라우저에만 남는다.
// v1은 직접 입력하던 지휘관 정보가 있던 형식이다. 보유 니케만 이어받는다.
const STORAGE_KEY = "syuennote:me:v2";
const LEGACY_KEY = "syuennote:me:v1";

function loadGame(): GameData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!saved) return emptyGame;
    const parsed = JSON.parse(saved) as Partial<GameData>;
    return { player: parsed.player ?? null, owned: parsed.owned ?? [] };
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
      <OwnedNikkes
        owned={game.owned}
        onChange={(update) => setStoredGame({ ...getGame(), owned: update(getGame().owned) })}
      />
    </>
  );
}

// 연달아 누를 때 앞선 변경을 덮어쓰지 않도록, 렌더 시점 값이 아니라 저장된 최신 값에서 바꾼다.
function OwnedNikkes({
  owned,
  onChange,
}: {
  owned: number[];
  onChange: (update: (owned: number[]) => number[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState<(typeof rarities)[number] | null>(null);
  const [ownedFilter, setOwnedFilter] = useState<(typeof ownedFilters)[number]>("전체");

  const ownedSet = new Set(owned);
  const needle = normalize(query);
  const visible = nikkes.filter(
    (nikke) =>
      normalize(nikke.name).includes(needle) &&
      (!rarity || nikke.rarity === rarity) &&
      (ownedFilter === "전체" || (ownedFilter === "보유") === ownedSet.has(nikke.id)),
  );
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
          <p className="mt-1 text-sm text-ink-2">가진 니케를 눌러 표시합니다. 다시 누르면 해제됩니다.</p>
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
      </div>

      <div className="mt-4 flex min-h-11 items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm font-bold text-ink-2">
          {visible.length}명 표시
        </p>
        {visible.length > 0 && (
          <button type="button" onClick={toggleVisible} className="-mr-2 min-h-11 px-2 text-sm font-bold text-violet hover:text-ink">
            {allVisibleOwned ? "표시된 니케 모두 해제" : "표시된 니케 모두 보유"}
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
          {visible.map((nikke) => (
            <li key={nikke.id}>
              <OwnedTile nikke={nikke} on={ownedSet.has(nikke.id)} onToggle={() => toggle(nikke.id)} />
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

function OwnedTile({ nikke, on, onToggle }: { nikke: Nikke; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className="relative block aspect-[2/3] w-full overflow-hidden rounded-lg bg-raise-2 text-left outline-offset-2 aria-pressed:ring-2 aria-pressed:ring-violet"
    >
      <NikkeImage
        lazy
        src={nikkeImageUrl(nikke)}
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
        <span className="line-clamp-2">{nikke.name}</span>
      </span>
    </button>
  );
}
