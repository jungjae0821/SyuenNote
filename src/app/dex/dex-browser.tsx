"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Tile } from "@/components/title-wall";
import { type Nikke, nikkeImageUrl, nikkes } from "@/data/nikkes";
import { type FilterKey, filters, optionLabel } from "./filters";

// 띄어쓰기와 대소문자를 무시한다. "레드후드", "idoll"도 찾히게.
function normalize(text: string) {
  return text.replace(/\s+/g, "").toLowerCase();
}

export function DexBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const selected = (key: FilterKey) => searchParams.getAll(key);
  const activeCount = filters.reduce((sum, filter) => sum + selected(filter.key).length, 0);

  function replaceParams(params: URLSearchParams) {
    const search = params.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  }

  function toggle(key: FilterKey, option: string) {
    const params = new URLSearchParams(searchParams);
    const values = params.getAll(key);
    params.delete(key);
    for (const value of values.includes(option) ? values.filter((v) => v !== option) : [...values, option]) {
      params.append(key, value);
    }
    replaceParams(params);
  }

  function changeQuery(value: string) {
    setQuery(value);
    const params = new URLSearchParams(searchParams);
    if (value) params.set("q", value);
    else params.delete("q");
    replaceParams(params);
  }

  function reset() {
    setQuery("");
    replaceParams(new URLSearchParams());
  }

  const needle = normalize(query);
  const results = nikkes.filter(
    (nikke) =>
      normalize(nikke.name).includes(needle) &&
      filters.every((filter) => {
        const values = selected(filter.key);
        return values.length === 0 || values.includes(nikke[filter.field]);
      }),
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-1 basis-64 md:max-w-sm">
          <span className="sr-only">니케 이름 검색</span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 fill-none stroke-ink-2 stroke-2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            placeholder="이름으로 찾기"
            className="h-12 w-full rounded-lg bg-raise pr-4 pl-11 text-base placeholder:text-ink-2"
          />
        </label>
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          aria-controls="dex-filters"
          className="h-12 rounded-lg bg-raise px-4 font-bold md:hidden"
        >
          필터{activeCount > 0 && <span className="ml-1.5 text-violet">{activeCount}</span>}
        </button>
      </div>

      <div id="dex-filters" className={`mt-4 gap-x-10 gap-y-3 md:grid md:grid-cols-2 xl:grid-cols-3 ${filtersOpen ? "grid" : "hidden"}`}>
        {filters.map((filter) => (
          <fieldset key={filter.key} className="flex min-w-0 items-start gap-3">
            <legend className="sr-only">{filter.label}</legend>
            <span aria-hidden="true" className="w-12 shrink-0 pt-2.5 text-sm font-bold text-ink-2">
              {filter.label}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {filter.options.map((option) => {
                const on = selected(filter.key).includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(filter.key, option)}
                    className={`min-h-11 rounded-lg px-3 text-sm font-bold transition-colors ${
                      on ? "bg-ink text-ground" : "bg-raise text-ink-2 hover:bg-raise-2 hover:text-ink"
                    }`}
                  >
                    {optionLabel(filter.key, option)}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-6 flex min-h-11 items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm font-bold text-ink-2">
          {results.length === nikkes.length ? `${nikkes.length}명` : `${nikkes.length}명 중 ${results.length}명`}
        </p>
        {(activeCount > 0 || query) && (
          <button type="button" onClick={reset} className="-mr-2 min-h-11 px-2 text-sm font-bold text-ink-2 hover:text-ink">
            조건 지우기
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <NikkeGrid nikkes={results} />
      ) : (
        <div className="mt-3 rounded-xl bg-raise p-6">
          <p className="font-extrabold">조건에 맞는 니케가 없습니다</p>
          <p className="mt-1 text-ink-2">검색어를 줄이거나 필터를 몇 개 풀어 보세요.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-lg bg-ink px-4 py-2.5 font-extrabold text-ground hover:opacity-85"
          >
            조건 지우기
          </button>
        </div>
      )}
    </>
  );
}

export function NikkeGrid({ nikkes }: { nikkes: Nikke[] }) {
  return (
    <div className="wall mt-3 grid grid-cols-2 gap-3 min-[360px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
      {nikkes.map((nikke) => (
        <Tile
          key={nikke.id}
          fluid
          href={`/dex/${nikke.id}`}
          name={nikke.name}
          rarity={nikke.rarity}
          detail={`${nikke.class} · ${nikke.weapon}`}
          image={nikkeImageUrl(nikke)}
        />
      ))}
    </div>
  );
}
