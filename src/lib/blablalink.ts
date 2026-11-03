// blablalink 프로필 ID는 "29080-1660639532925649206"처럼 생겼다(intl_openid).
// 프로필 주소(/user?openid=...)에는 이 값이 base64로 들어간다. 셋 중 무엇을 붙여넣어도 받는다.
const OPENID = /^\d{1,10}-\d{1,30}$/;

function decodeBase64(text: string) {
  try {
    return atob(text);
  } catch {
    return "";
  }
}

export function parseProfileId(input: string): string | null {
  let value = input.trim();
  if (value.length === 0 || value.length > 500) return null;

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (url.hostname !== "www.blablalink.com" && url.hostname !== "blablalink.com") return null;
      value = url.searchParams.get("openid") ?? "";
    } catch {
      return null;
    }
  }

  if (OPENID.test(value)) return value;
  const decoded = decodeBase64(value);
  return OPENID.test(decoded) ? decoded : null;
}

// GetRegionList 응답의 area_id (2026-11-03 확인).
export const serverNames: Record<string, string> = {
  "81": "일본",
  "82": "북미",
  "83": "한국",
  "84": "글로벌",
  "85": "동남아",
};

export type LinkStatus =
  | { status: "none" }
  | { status: "pending"; openid: string; area: string; code: string; expiresAt: string }
  | { status: "linked"; openid: string; area: string };

export type GameProfile = {
  nickname: string;
  level: number;
  combat: number;
  characterCount: number;
  costumeCount: number;
  tribeTower: number;
  createdAt: string | null;
  // 도감 id(src/data/nikkes.ts)로 바꾼 보유 니케
  owned: number[];
  // 니케별 육성 상태. id는 도감 id. grade는 한계 돌파 횟수, core는 코어 강화 단계.
  characters: OwnedCharacter[];
  // 프로필에 걸어 둔 대표 스쿼드(도감 id, 최대 5명)
  team: number[];
};

// costume은 입고 있는 코스튬 id(0이면 기본).
export type OwnedCharacter = { id: number; lv: number; grade: number; core: number; combat: number; costume: number };

// 니케 한 명의 상세(GetUserCharacterDetails). 니케를 열 때만 불러온다.
// 응답 중 의미를 확인한 값만 담는다. 옵션 수치(function_value)와 장비 제조사 보너스는 단위·대응을 확인하지 못해 넣지 않는다.
export type NikkeDetail = {
  skills: { skill1: number; skill2: number; burst: number };
  // 하모니 큐브 레벨. 큐브 종류 이름은 대응표가 없어 넣지 않는다.
  cubeLevel: number | null;
  favoriteItemLevel: number | null;
  bondLevel: number;
  equips: EquipSlot[];
};

export type EquipSlot = {
  slot: "head" | "torso" | "arm" | "leg";
  tier: number;
  level: number;
  // 오버로드 옵션. type은 응답의 function_type 그대로, level은 옵션 단계(1~15).
  options: { type: string; level: number }[];
} | null;
