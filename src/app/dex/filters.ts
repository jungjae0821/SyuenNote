import { manufacturers, type Nikke } from "@/data/nikkes";

// 도감 필터. key는 주소의 쿼리 이름이라서 상세 페이지와 홈에서도 같은 이름으로 링크한다.
export const filters = [
  { key: "rarity", label: "등급", field: "rarity", options: ["SSR", "SR", "R"] },
  { key: "maker", label: "제조사", field: "manufacturer", options: manufacturers },
  { key: "burst", label: "버스트", field: "burst", options: ["I", "II", "III", "전체"] },
  { key: "class", label: "클래스", field: "class", options: ["화력형", "방어형", "지원형"] },
  { key: "element", label: "속성", field: "element", options: ["작열", "수냉", "풍압", "전격", "철갑"] },
  { key: "weapon", label: "무기", field: "weapon", options: ["AR", "SMG", "SG", "SR", "RL", "MG"] },
] as const satisfies readonly { key: string; label: string; field: keyof Nikke; options: readonly string[] }[];

export type FilterKey = (typeof filters)[number]["key"];

// 버스트 "전체"는 필터 칩에서 "모두 보기"로 읽히기 쉬워서 게임 표기를 풀어 쓴다.
export function optionLabel(key: FilterKey, option: string) {
  return key === "burst" && option === "전체" ? "전 단계" : option;
}

export function dexHref(key: FilterKey, value: string) {
  return `/dex?${new URLSearchParams({ [key]: value })}`;
}
