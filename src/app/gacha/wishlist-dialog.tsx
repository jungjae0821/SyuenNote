"use client";

import { useEffect, useRef, useState } from "react";
import { NikkeImage } from "@/components/nikke-image";
import type { PickupBanner } from "@/data/banners";
import { nikkeImageUrl } from "@/data/nikkes";
import { WISHLIST_PER_GROUP, wishlistCandidates, wishlistGroups } from "@/lib/gacha";

const groupLabel = {
  엘리시온: "엘리시온",
  "미실리스 인더스트리": "미실리스",
  "테트라 라인": "테트라",
  "오버스펙/필그림": "오버스펙/필그림",
} as const;

// 일반 모집용 위시리스트 창. 열 때마다 새로 마운트해서 초안을 저장된 값으로 되돌린다.
// notice가 켜져 있으면 고르기 전에 안내부터 보여 준다.
export function WishlistDialog({
  notice,
  schedule,
  wishlist,
  onSave,
  onClose,
}: {
  notice: boolean;
  schedule: PickupBanner;
  wishlist: number[];
  onSave: (wishlist: number[]) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [showNotice, setShowNotice] = useState(notice);
  const [draft, setDraft] = useState(wishlist);
  const candidates = wishlistCandidates(schedule);
  const allowed = new Set(candidates.map((item) => item.nikke.id));
  // 이 시점에 고를 수 없는 니케는 초안에서 빠진다.
  const picked = draft.filter((id) => allowed.has(id));

  // Esc로 닫을 때를 위해 close 이벤트를 직접 듣는다. 이 이벤트는 다음 화면 갱신 때 오므로
  // 버튼으로 닫을 때는 close()에서 바로 부모에 알린다.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.addEventListener("close", onClose);
    if (!dialog.open) dialog.showModal();
    return () => dialog.removeEventListener("close", onClose);
  }, [onClose]);

  function close() {
    ref.current?.close();
    onClose();
  }

  function toggle(id: number) {
    setDraft(picked.includes(id) ? picked.filter((item) => item !== id) : [...picked, id]);
  }

  const total = wishlistGroups.length * WISHLIST_PER_GROUP;

  return (
    <dialog
      ref={ref}
      aria-labelledby="wishlist-title"
      className="m-auto max-h-[min(90dvh,860px)] w-[min(100%-2rem,880px)] rounded-xl bg-raise p-0 text-ink backdrop:bg-ground/80"
    >
      {showNotice ? (
        <div className="p-6">
          <h2 id="wishlist-title" className="text-xl font-black tracking-[-0.02em]">
            위시리스트를 먼저 지정해 주세요
          </h2>
          <p className="mt-2 text-ink-2">
            일반 모집은 위시리스트 픽업으로 진행됩니다. 엘리시온, 미실리스, 테트라, 오버스펙/필그림에서 5명씩 모두 {total}
            명을 골라야 모집할 수 있습니다.
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={close} className="min-h-11 rounded-lg px-4 font-bold text-ink-2 hover:text-ink">
              닫기
            </button>
            <button
              type="button"
              autoFocus
              onClick={() => setShowNotice(false)}
              className="min-h-11 rounded-lg bg-ink px-5 font-extrabold text-ground hover:opacity-85"
            >
              위시리스트 지정하기
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave(picked);
            close();
          }}
          className="flex max-h-[inherit] flex-col"
        >
          <div className="border-b border-line px-5 pt-5 pb-4 md:px-6">
            <h2 id="wishlist-title" className="text-xl font-black tracking-[-0.02em]">
              위시리스트
            </h2>
            <p className="mt-1 text-sm text-ink-2">
              제조사마다 5명씩 고릅니다. 한정 니케는 위시리스트에 넣을 수 없어 목록에 없습니다.
            </p>
          </div>

          <div className="grid gap-6 overflow-y-auto px-5 py-5 md:px-6">
            {wishlistGroups.map((group) => {
              const items = candidates.filter((item) => item.group === group);
              const count = items.filter((item) => picked.includes(item.nikke.id)).length;
              const full = count >= WISHLIST_PER_GROUP;
              return (
                <fieldset key={group}>
                  <legend className="flex w-full justify-between text-sm font-extrabold">
                    <span>{groupLabel[group]}</span>
                    <span className={`tabular-nums ${full ? "text-violet" : "text-ink-2"}`}>
                      {count} / {WISHLIST_PER_GROUP}
                    </span>
                  </legend>
                  <ul className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                    {items.map(({ nikke }) => {
                      const on = picked.includes(nikke.id);
                      return (
                        <li key={nikke.id}>
                          <button
                            type="button"
                            aria-pressed={on}
                            disabled={full && !on}
                            onClick={() => toggle(nikke.id)}
                            className={`relative block aspect-[2/3] w-full overflow-hidden rounded-lg bg-raise-2 text-left outline-offset-2 aria-pressed:ring-2 aria-pressed:ring-violet disabled:cursor-not-allowed ${
                              !on && full ? "opacity-40" : ""
                            }`}
                          >
                            <NikkeImage
                              lazy
                              src={nikkeImageUrl(nikke)}
                              alt=""
                              className="absolute inset-0 size-full object-cover"
                              fallback={
                                <span
                                  aria-hidden="true"
                                  className="absolute inset-x-1 top-3 text-lg leading-none font-black tracking-[-0.04em] text-raise"
                                >
                                  {nikke.name}
                                </span>
                              }
                            />
                            {on && (
                              <span className="absolute top-1 right-1 rounded bg-violet px-1 text-[10px] font-black text-ground">
                                선택
                              </span>
                            )}
                            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ground to-transparent px-1 pt-5 pb-1 text-[11px] leading-tight font-bold text-ink md:text-xs">
                              <span className="line-clamp-2">{nikke.name}</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 md:px-6">
            <p className="text-sm font-bold text-ink-2 tabular-nums">
              {picked.length} / {total}명 선택
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={close} className="min-h-11 rounded-lg px-4 font-bold text-ink-2 hover:text-ink">
                취소
              </button>
              <button
                type="submit"
                disabled={picked.length < total}
                className="min-h-11 rounded-lg bg-ink px-5 font-extrabold text-ground hover:opacity-85 disabled:bg-raise-2 disabled:text-ink-2 disabled:hover:opacity-100"
              >
                저장
              </button>
            </div>
          </div>
        </form>
      )}
    </dialog>
  );
}
