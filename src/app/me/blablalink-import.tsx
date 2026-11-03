"use client";

import { useEffect, useState } from "react";
import { type GameProfile, type LinkStatus, parseProfileId, serverNames } from "@/lib/blablalink";

export type Player = { openid: string; fetchedAt: string; profile: GameProfile };

const errorMessages: Record<string, string> = {
  invalid: "프로필을 알아보지 못했습니다. blablalink 프로필 주소를 그대로 붙여넣어 주세요.",
  "code-not-found":
    "상태메시지에서 인증코드를 찾지 못했습니다. 저장했다면 blablalink에 반영되기까지 2~3분 걸릴 수 있으니 잠시 뒤 다시 눌러 주세요.",
  "code-expired": "인증코드가 만료됐습니다. 새 코드를 받아 주세요.",
  "no-pending": "진행 중인 인증이 없습니다. 인증코드를 다시 받아 주세요.",
  "not-linked": "먼저 blablalink 프로필을 연결해 주세요.",
  "no-game-account":
    "게임 정보를 받지 못했습니다. 아래 안내대로 시프티패드 공개 설정을 확인하고, 고른 서버가 맞는지 확인해 주세요. 서버가 다르면 연결을 해제하고 다시 연결해 주세요.",
  "bot-session-expired": "슈엔노트의 blablalink 연결이 만료됐습니다. 운영자가 다시 연결할 때까지 기다려 주세요.",
  "bot-session-missing": "슈엔노트의 blablalink 연결이 아직 설정되지 않았습니다.",
  upstream: "blablalink에서 응답을 받지 못했습니다. 잠시 뒤 다시 시도해 주세요.",
  db: "저장소에 접근하지 못했습니다. 잠시 뒤 다시 시도해 주세요.",
  forbidden: "이 사이트 안에서만 쓸 수 있습니다.",
  "login-required": "로그인이 풀렸습니다. 다시 로그인해 주세요.",
};

async function api<T>(path: string, method: "GET" | "POST" | "DELETE", body?: unknown): Promise<T> {
  const response = await fetch(`/api/blablalink/${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(json.error ?? "upstream");
  return json;
}

function profileUrl(openid: string) {
  return `https://www.blablalink.com/user?openid=${btoa(openid)}`;
}

// 한국 서버 유저가 기본이라 한국을 맨 위에 둔다.
const serverOrder = ["83", "81", "84", "82", "85"];

const primary =
  "min-h-11 rounded-lg bg-ink px-5 font-extrabold text-ground hover:opacity-85 disabled:bg-raise-2 disabled:text-ink-2 disabled:hover:opacity-100";
const secondary = "min-h-11 rounded-lg px-4 font-bold text-ink-2 hover:text-ink disabled:opacity-50";

export function BlablalinkImport({
  player,
  onPlayer,
}: {
  player: Player | null;
  onPlayer: (player: Player | null) => void;
}) {
  const [link, setLink] = useState<LinkStatus | null>(null);
  const [input, setInput] = useState("");
  const [area, setArea] = useState("83");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api<LinkStatus>("link", "GET")
      .then(setLink)
      .catch((caught: Error) => {
        setError(errorMessages[caught.message] ?? errorMessages.upstream);
        setLink({ status: "none" });
      });
  }, []);

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (caught) {
      setError(errorMessages[caught instanceof Error ? caught.message : ""] ?? errorMessages.upstream);
    } finally {
      setBusy(false);
    }
  }

  const start = (event: React.FormEvent) => {
    event.preventDefault();
    if (!parseProfileId(input)) {
      setError(errorMessages.invalid);
      return;
    }
    run(async () => {
      setLink(await api<LinkStatus>("link", "POST", { profile: input, area }));
      setInput("");
    });
  };

  const verify = () => run(async () => setLink(await api<LinkStatus>("link/verify", "POST")));

  const unlink = () =>
    run(async () => {
      setLink(await api<LinkStatus>("link", "DELETE"));
      onPlayer(null);
    });

  const load = () =>
    run(async () => {
      const body = await api<{ openid: string; profile: GameProfile }>("player", "POST");
      onPlayer({ openid: body.openid, fetchedAt: new Date().toISOString(), profile: body.profile });
    });

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드를 못 쓰면 코드를 직접 선택해 복사하면 된다.
    }
  }

  // 예전 형식으로 저장된 기록(profile 없음)은 보여 주지 않고 다시 불러오게 한다.
  const shownPlayer = link?.status === "linked" && player?.openid === link.openid && player.profile ? player : null;
  const values = shownPlayer
    ? [
        { label: "닉네임", value: shownPlayer.profile.nickname },
        { label: "서버", value: serverNames[link?.status === "linked" ? link.area : ""] ?? "" },
        { label: "지휘관 레벨", value: shownPlayer.profile.level.toLocaleString("ko-KR") },
        { label: "스쿼드 전투력", value: shownPlayer.profile.combat.toLocaleString("ko-KR") },
        { label: "보유 니케", value: `${shownPlayer.profile.characterCount}명` },
        { label: "코스튬", value: `${shownPlayer.profile.costumeCount}벌` },
        { label: "트라이브 타워", value: `${shownPlayer.profile.tribeTower}층` },
        {
          label: "가입일",
          value: shownPlayer.profile.createdAt ? new Date(shownPlayer.profile.createdAt).toLocaleDateString("ko-KR") : "",
        },
      ].filter((item) => item.value)
    : [];

  return (
    <section aria-labelledby="import-title" aria-busy={!link} className="rounded-xl bg-raise p-5 md:col-span-2">
      <h2 id="import-title" className="text-lg font-extrabold">
        게임 정보
      </h2>

      {!link && <div className="mt-3 h-24 max-w-2xl rounded-lg bg-raise-2" />}

      {link?.status === "none" && (
        <>
          <p className="mt-1 max-w-[70ch] text-sm text-ink-2">
            blablalink 프로필을 연결하면 게임 정보를 불러옵니다. blablalink에 로그인해 프로필 초상화를 눌러 내 프로필을
            열고, 주소창의 주소를 붙여넣으세요. 인게임 UID가 아니라 프로필 주소입니다. 비밀번호나 쿠키는 받지 않습니다.
          </p>
          <form onSubmit={start} className="mt-4 flex max-w-2xl flex-wrap gap-3">
            <label>
              <span className="sr-only">게임 서버</span>
              <select
                value={area}
                onChange={(event) => setArea(event.target.value)}
                className="h-12 rounded-lg bg-raise-2 px-3.5 text-base"
              >
                {serverOrder.map((id) => (
                  <option key={id} value={id}>
                    {serverNames[id]}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0 flex-1 basis-64">
              <span className="sr-only">blablalink 프로필 주소</span>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="https://www.blablalink.com/user?openid=..."
                autoComplete="off"
                spellCheck={false}
                className="h-12 w-full rounded-lg bg-raise-2 px-3.5 text-base placeholder:text-ink-2"
              />
            </label>
            <button type="submit" disabled={!input.trim() || busy} className={primary}>
              인증코드 받기
            </button>
          </form>
        </>
      )}

      {link?.status === "pending" && (
        <div className="mt-3 max-w-2xl">
          <p className="text-sm text-ink-2">
            아래 코드를{" "}
            <a href={profileUrl(link.openid)} target="_blank" rel="noreferrer" className="font-bold text-violet hover:text-ink">
              blablalink 프로필
            </a>
            의 상태메시지에 적고 저장한 뒤 확인을 누르세요. 반영까지 2~3분 걸릴 수 있습니다. 본인 프로필인지 확인하는
            용도이며, 연결이 끝나면 지워도 됩니다.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <code className="rounded-lg bg-ground px-4 py-2.5 text-2xl font-black tracking-[0.08em] select-all">{link.code}</code>
            <button type="button" onClick={() => copy(link.code)} className={secondary}>
              {copied ? "복사했습니다" : "복사"}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-2">
            {new Date(link.expiresAt).toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" })}까지 유효
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={verify} disabled={busy} className={primary}>
              {busy ? "확인하는 중" : "확인"}
            </button>
            <button type="button" onClick={unlink} disabled={busy} className={secondary}>
              취소
            </button>
          </div>
        </div>
      )}

      {link?.status === "linked" && (
        <div className="mt-3">
          <p className="text-sm text-ink-2">
            <a href={profileUrl(link.openid)} target="_blank" rel="noreferrer" className="font-bold text-violet hover:text-ink">
              blablalink 프로필
            </a>
            이 연결되어 있습니다 ({serverNames[link.area] ?? link.area} 서버). 상태메시지의 인증코드는 지워도 됩니다.
          </p>
          <details className="mt-3 max-w-2xl rounded-lg bg-raise-2 p-4 text-sm">
            <summary className="cursor-pointer font-bold">불러오기 전에: 시프티패드 공개 설정</summary>
            <p className="mt-2 text-ink-2">
              blablalink 내 프로필 오른쪽 위 자물쇠 아이콘에서 아래 항목을 모두 &ldquo;모두에게 공개&rdquo;로 바꿔야 합니다.
            </p>
            <ul className="mt-2 grid list-disc gap-1 pl-5 text-ink-2">
              <li>홈페이지에 게임 카드(기본 정보) 표시</li>
              <li>SHIFTYPAD에 전초기지 정보 표시</li>
              <li>SHIFTYPAD에 나의 니케 표시</li>
              <li>SHIFTYPAD에 유니온 정보 표시</li>
            </ul>
          </details>

          {shownPlayer && (
            <div className="mt-4">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                {values.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-sm font-bold text-ink-2">{label}</dt>
                    <dd className="font-extrabold tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-ink-2">
                {new Date(shownPlayer.fetchedAt).toLocaleString("ko-KR")}에 불러옴. 아래 보유 니케에도 반영했습니다.
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={load} disabled={busy} className={primary}>
              {busy ? "불러오는 중" : shownPlayer ? "다시 불러오기" : "게임 정보 불러오기"}
            </button>
            <button
              type="button"
              onClick={() => window.confirm("blablalink 프로필 연결을 해제할까요?") && unlink()}
              disabled={busy}
              className={secondary}
            >
              연결 해제
            </button>
          </div>
        </div>
      )}

      <p aria-live="polite" className="mt-2 text-sm font-bold text-[#ffd0dc] empty:hidden">
        {error}
      </p>
    </section>
  );
}
