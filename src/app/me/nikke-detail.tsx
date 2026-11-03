"use client";

import { useEffect, useRef, useState } from "react";
import { NikkeImage } from "@/components/nikke-image";
import { rarityColor } from "@/components/title-wall";
import { wornImageUrl } from "@/data/costumes";
import { nikkeIdByNameCode } from "@/data/name-codes";
import type { Nikke } from "@/data/nikkes";
import type { EquipSlot, NikkeDetail, OwnedCharacter } from "@/lib/blablalink";

const nameCodeById = new Map(Object.entries(nikkeIdByNameCode).map(([code, id]) => [id, Number(code)]));

// 같은 니케를 다시 열면 다시 요청하지 않는다. 게임 정보를 다시 불러오면(fetchedAt이 바뀌면) 새로 받는다.
const cache = new Map<string, NikkeDetail>();
// 개발 모드에서 effect가 두 번 돌거나 창을 빨리 다시 열어도 요청은 한 번만 나가게, 진행 중인 요청을 함께 쓴다.
const pending = new Map<string, Promise<NikkeDetail>>();

function loadDetail(key: string, nikkeId: number) {
  let request = pending.get(key);
  if (!request) {
    request = fetch("/api/blablalink/character", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameCode: nameCodeById.get(nikkeId) }),
    })
      .then(async (response) => {
        const json = (await response.json().catch(() => ({}))) as { detail?: NikkeDetail; error?: string };
        if (!response.ok || !json.detail) throw new Error(json.error ?? "upstream");
        cache.set(key, json.detail);
        return json.detail;
      })
      .finally(() => pending.delete(key));
    pending.set(key, request);
  }
  return request;
}

const errorMessages: Record<string, string> = {
  "not-owned": "이 니케의 상세 정보를 받지 못했습니다. 보유 목록이 바뀌었다면 게임 정보를 다시 불러와 주세요.",
  "too-frequent": "요청이 몰려 잠시 받지 못했습니다. 몇 초 뒤에 다시 시도해 주세요.",
  "not-linked": "먼저 blablalink 프로필을 연결해 주세요.",
  "bot-session-expired": "슈엔노트의 blablalink 연결이 만료됐습니다. 운영자가 다시 연결할 때까지 기다려 주세요.",
  "bot-session-missing": "슈엔노트의 blablalink 연결이 아직 설정되지 않았습니다.",
  "login-required": "로그인이 풀렸습니다. 다시 로그인해 주세요.",
  upstream: "blablalink에서 응답을 받지 못했습니다. 잠시 뒤 다시 시도해 주세요.",
};

const slotNames = { head: "머리", torso: "몸통", arm: "팔", leg: "다리" } as const;

// 오버로드 옵션 종류. 응답의 function_type이 이 표에 있을 때만 이름을 붙이고, 없으면 원래 값을 그대로 보인다.
// 응답에서 직접 본 것은 StatCriticalDamage뿐이다. 나머지는 게임 옵션 이름과 짝지은 값이라 맞지 않으면 원래 값이 보인다.
const optionNames: Record<string, string> = {
  StatAtk: "공격력 증가",
  IncElementDmg: "우월코드 대미지 증가",
  StatAccuracyCircle: "명중률 증가",
  StatAmmoLoad: "최대 장탄 수 증가",
  StatChargeDamage: "차지 대미지 증가",
  StatChargeTime: "차지 속도 증가",
  StatCritical: "크리티컬 확률 증가",
  StatCriticalDamage: "크리티컬 피해량 증가",
  StatDef: "방어력 증가",
};

export function NikkeDetailDialog({
  nikke,
  growth,
  fetchedAt,
  onClose,
}: {
  nikke: Nikke;
  growth?: OwnedCharacter;
  fetchedAt: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const key = `${fetchedAt}:${nikke.id}`;
  const [loaded, setLoaded] = useState<{ key: string; detail?: NikkeDetail; error?: string } | null>(null);
  const cached = cache.get(key);
  const detail = cached ?? (loaded?.key === key ? loaded.detail : undefined);
  const error = loaded?.key === key ? loaded.error : undefined;

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cache.has(key)) return;
    let cancelled = false;
    loadDetail(key, nikke.id)
      .then((result) => !cancelled && setLoaded({ key, detail: result }))
      .catch((caught: Error) => {
        if (!cancelled) setLoaded({ key, error: errorMessages[caught.message] ?? errorMessages.upstream });
      });
    return () => {
      cancelled = true;
    };
  }, [key, nikke.id, attempt]);

  function retry() {
    setLoaded(null);
    setAttempt((value) => value + 1);
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && ref.current?.close()}
      aria-labelledby="nikke-detail-title"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-xl bg-raise p-0 text-ink backdrop:bg-ground/80"
    >
      <div className="flex gap-4 p-5">
        <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-lg bg-raise-2">
          <NikkeImage
            src={wornImageUrl(nikke, growth?.costume)}
            alt=""
            className="absolute inset-0 size-full object-cover"
            fallback={<span className="absolute inset-x-1 top-2 text-sm font-black text-ink-2">{nikke.name}</span>}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-black ${rarityColor[nikke.rarity]}`}>{nikke.rarity}</p>
          <h2 id="nikke-detail-title" className="text-xl leading-tight font-black">
            {nikke.name}
          </h2>
          <p className="mt-1 text-sm text-ink-2">
            {nikke.manufacturer} · {nikke.class} · 버스트 {nikke.burst === "전체" ? "전환" : nikke.burst}
          </p>
          {growth && growth.combat > 0 && (
            <p className="mt-2 text-sm">
              전투력 <b className="tabular-nums">{growth.combat.toLocaleString("ko-KR")}</b>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          className="-mt-2 -mr-2 size-11 shrink-0 rounded-lg text-xl font-bold text-ink-2 hover:text-ink"
          aria-label="닫기"
        >
          ×
        </button>
      </div>

      <div aria-live="polite" className="border-t border-raise-2 p-5">
        {detail ? (
          <DetailBody detail={detail} />
        ) : error ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-bold text-[#ffd0dc]">{error}</p>
            <button type="button" onClick={retry} className="min-h-11 rounded-lg bg-raise-2 px-4 text-sm font-bold hover:text-violet">
              다시 시도
            </button>
          </div>
        ) : (
          <div aria-label="불러오는 중" className="grid gap-3">
            <div className="h-14 rounded-lg bg-raise-2" />
            <div className="h-40 rounded-lg bg-raise-2" />
          </div>
        )}
      </div>
    </dialog>
  );
}

function DetailBody({ detail }: { detail: NikkeDetail }) {
  const stats = [
    { label: "스킬 1", value: `Lv ${detail.skills.skill1}` },
    { label: "스킬 2", value: `Lv ${detail.skills.skill2}` },
    { label: "버스트", value: `Lv ${detail.skills.burst}` },
    { label: "호감도", value: `Lv ${detail.bondLevel}` },
    { label: "하모니 큐브", value: detail.cubeLevel === null ? "없음" : `Lv ${detail.cubeLevel}` },
    { label: "소장품", value: detail.favoriteItemLevel === null ? "없음" : `Lv ${detail.favoriteItemLevel}` },
  ];
  return (
    <>
      <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
        {stats.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs font-bold text-ink-2">{label}</dt>
            <dd className="font-extrabold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-6 text-sm font-bold text-ink-2">장비</h3>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {(["head", "torso", "arm", "leg"] as const).map((slot) => (
          <EquipCard key={slot} slot={slot} equip={detail.equips.find((item) => item?.slot === slot) ?? null} />
        ))}
      </ul>
    </>
  );
}

function EquipCard({ slot, equip }: { slot: keyof typeof slotNames; equip: EquipSlot }) {
  return (
    <li className="rounded-lg bg-raise-2 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-extrabold">{slotNames[slot]}</span>
        {equip && (
          <span className="text-sm font-bold text-ink-2 tabular-nums">
            T{equip.tier} · 강화 {equip.level}
          </span>
        )}
      </div>
      {!equip ? (
        <p className="mt-1 text-sm text-ink-2">장착하지 않음</p>
      ) : equip.options.length > 0 ? (
        <ul className="mt-2 grid gap-1 text-sm">
          {equip.options.map((option, index) => (
            <li key={index} className="flex justify-between gap-2">
              <span className="min-w-0 break-words">{optionNames[option.type] ?? option.type}</span>
              <span className="shrink-0 font-bold text-violet tabular-nums">{option.level}단계</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-ink-2">오버로드 옵션 없음</p>
      )}
    </li>
  );
}
