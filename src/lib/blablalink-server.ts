import "server-only";
import { nikkeIdByNameCode } from "@/data/name-codes";
import type { GameProfile } from "./blablalink";
import { decryptSession } from "./session-crypto";
import { createAdminClient } from "./supabase/admin";

// blablalink 웹이 보내는 공통 헤더 (2026-11-03 확인). 시프티패드(게임 정보) 요청은 니케 게임 값을 싣는다.
const communityParams = JSON.stringify({
  game_id: "",
  area_id: "",
  source: "pc_web",
  intl_game_id: "",
  language: "ko",
  env: "prod",
  data_statistics_scene: "outer",
  data_statistics_page_id: "https://www.blablalink.com/user",
  data_statistics_client_type: "pc_web",
  data_statistics_lang: "ko",
});

const shiftyspadParams = JSON.stringify({
  game_id: "16",
  area_id: "global",
  source: "pc_web",
  intl_game_id: "29080",
  language: "ko",
  env: "prod",
  data_statistics_scene: "outer",
  data_statistics_page_id: "https://www.blablalink.com/shiftyspad/home",
  data_statistics_client_type: "pc_web",
  data_statistics_lang: "ko",
});

type ApiBody = { code?: number; data?: unknown };

export class BlablalinkError extends Error {}

async function call(path: string, body: unknown, options: { cookie?: string; shiftyspad?: boolean } = {}): Promise<ApiBody> {
  try {
    const response = await fetch(`https://api.blablalink.com/api/${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "x-channel-type": "2",
        "x-common-params": options.shiftyspad ? shiftyspadParams : communityParams,
        "x-language": "ko",
        ...(options.cookie && { Cookie: options.cookie }),
      },
      body: JSON.stringify(body),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
    return await response.json();
  } catch {
    // 오류 객체에 요청 헤더(쿠키)가 섞일 수 있어 원인을 밖으로 넘기지 않는다.
    throw new BlablalinkError("upstream");
  }
}

// 공개 프로필의 자기소개. 비로그인으로 읽힌다. 인증코드 확인에 쓴다.
export async function fetchRemark(openid: string) {
  const body = await call("ugc/direct/standalonesite/User/GetUserProfile", { intl_openid: openid });
  if (body.code !== 0) throw new BlablalinkError("upstream");
  const info = (body.data as { info?: { remark?: unknown } } | undefined)?.info;
  return typeof info?.remark === "string" ? info.remark : "";
}

// 시프티패드가 쓰는 게임 정보 요청 (2026-11-03, 로그인 상태에서 확인).
// 몸통은 { intl_open_id: "29080-" 뒤의 숫자, nikke_area_id: 서버 번호 }이고, 비로그인이면 300001이 온다.
// 운영 계정으로 남의 프로필을 볼 수 있다는 전제는 아직 확인하지 못했다(본인 계정으로만 확인).
export async function fetchGameProfile(openid: string, area: string): Promise<GameProfile> {
  const cookie = await botCookie();
  const body = { intl_open_id: openid.replace(/^\d+-/, ""), nikke_area_id: Number(area) };
  const [basic, characters] = await Promise.all([
    call("game/proxy/Game/GetUserProfileBasicInfo", body, { cookie, shiftyspad: true }),
    call("game/proxy/Game/GetUserCharacters", body, { cookie, shiftyspad: true }),
  ]);
  for (const result of [basic, characters]) {
    if (result.code === 300001) throw new BlablalinkError("bot-session-expired");
    if (result.code !== 0) throw new BlablalinkError("no-game-account");
  }

  const info = ((basic.data as { basic_info?: Record<string, unknown> } | undefined)?.basic_info ?? {}) as Record<
    string,
    unknown
  >;
  const list = ((characters.data as { characters?: { name_code?: unknown }[] } | undefined)?.characters ?? []);
  const number = (value: unknown) => (typeof value === "number" ? value : Number(value) || 0);
  const created = number(info.created_at);

  // 응답 전체를 넘기지 않고 쓰는 값만 골라 보낸다.
  return {
    nickname: typeof info.nickname === "string" ? info.nickname : "",
    level: number(info.lv),
    combat: number(info.team_combat),
    characterCount: number(info.character_count),
    costumeCount: number(info.character_costume_count),
    tribeTower: number(info.progress_tribe_tower),
    createdAt: created ? new Date(created * 1000).toISOString() : null,
    owned: list.flatMap((item) => {
      const id = nikkeIdByNameCode[number(item.name_code)];
      return id ? [id] : [];
    }),
  };
}

// 세션은 요청마다 DB에서 암호문을 읽어 메모리에서만 푼다. 모듈 변수에 남기지 않는다.
async function botCookie() {
  const { data, error } = await createAdminClient()
    .from("bot_sessions")
    .select("ciphertext")
    .eq("id", "blablalink")
    .maybeSingle();
  if (error || !data) throw new BlablalinkError("bot-session-missing");
  try {
    return decryptSession(data.ciphertext as string);
  } catch {
    throw new BlablalinkError("bot-session-missing");
  }
}
