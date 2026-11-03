import { type PickupBanner, pickupBanners } from "@/data/banners";
import { type Nikke, nikkes } from "@/data/nikkes";

// 모집에 나오지 않는 니케.
const excludedNames = new Set([
  "니힐리스타",
  "퀀시",
  "신",
  "길티",
  "앵커",
  // 배포 니케
  "아비스타",
  "킬로",
  "라이",
  "스노우 화이트 : 이노센트 데이즈",
  "라푼젤 : 퓨어 그레이스",
  "차임",
  "라푼젤 : 생츄어리",
  "모리",
]);

// 배포 콜라보 SR. 이름이 겹치는 니케가 있어서(사쿠라) id로 뺀다.
const excludedIds = new Set([
  580201, // 히메노
  581201, // 파스칼
  582201, // 람
  583301, // 미사토
  583601, // 사쿠라 (어브노멀 SR)
  585201, // 릴리
  584201, // 클레어
  586201, // 쿠루미
  587201, // 아이기스
]);

export const pool = nikkes.filter((nikke) => !excludedNames.has(nikke.name) && !excludedIds.has(nikke.id));

export const ssrPool = pool.filter((nikke) => nikke.rarity === "SSR");
const srPool = pool.filter((nikke) => nikke.rarity === "SR");
const rPool = pool.filter((nikke) => nikke.rarity === "R");

// 서비스 시작일. 픽업 기록이 없는 니케는 이날부터 모집에 있었다고 본다.
const LAUNCH = "2022-11-04";
// 출시 때부터 있었지만 나중에 처음 픽업된 니케.
const launchRoster = new Set(["앨리스"]);

// 픽업 일정에서 처음 나온 픽업이 끝난 날. 신규 니케는 첫 픽업이 끝난 뒤 일반 풀에 들어간다고 본다.
const joinsPoolOn = new Map<number, string>();
// 콜라보 니케는 픽업 기록과 상관없이 자기 픽업에서만 나온다.
const limitedIds = new Set(pool.filter((nikke) => nikke.manufacturer === "어브노멀").map((nikke) => nikke.id));
for (const banner of pickupBanners) {
  if (banner.limited) limitedIds.add(banner.nikkeId);
  if (!joinsPoolOn.has(banner.nikkeId)) joinsPoolOn.set(banner.nikkeId, banner.end);
}

// 이 픽업이 열린 시점에 모집에서 나올 수 있는 SSR. 한정 니케는 자기 픽업에서만 나온다.
export function ssrPoolAt(schedule: PickupBanner) {
  return ssrPool.filter((nikke) => {
    if (limitedIds.has(nikke.id)) return false;
    const joined = launchRoster.has(nikke.name) ? LAUNCH : (joinsPoolOn.get(nikke.id) ?? LAUNCH);
    return joined <= schedule.start;
  });
}

// 시뮬레이터에서 고를 수 있는 픽업. 모집 제외 니케의 픽업은 뺀다. 콜라보 픽업도 니케마다 하나씩 고른다.
export const schedules = pickupBanners.filter((banner) => ssrPool.some((nikke) => nikke.id === banner.nikkeId));

// 일반 모집은 위시리스트 픽업으로 돈다. 제조사마다 5명씩, 모두 20명을 채워야 한다.
export const wishlistGroups = ["엘리시온", "미실리스 인더스트리", "테트라 라인", "오버스펙/필그림"] as const;
export type WishlistGroup = (typeof wishlistGroups)[number];
export const WISHLIST_PER_GROUP = 5;

// 원래 제조사와 달리 오버스펙/필그림 칸에서 고르는 니케 (사용자 지정).
const pilgrimSlotNames = new Set(["라피 : 레드 후드", "미하라 : 본딩 체인", "네온 : 비전 아이", "아니스 : 스타"]);

export function wishlistGroup(nikke: Nikke): WishlistGroup | null {
  if (pilgrimSlotNames.has(nikke.name)) return "오버스펙/필그림";
  return (wishlistGroups as readonly string[]).includes(nikke.manufacturer) ? (nikke.manufacturer as WishlistGroup) : null;
}

// 위시리스트 창에 보이는 니케: 이 시점까지 일반 풀에 들어온 SSR. 한정 니케는 보이지 않는다.
export function wishlistCandidates(schedule: PickupBanner) {
  return ssrPoolAt(schedule).flatMap((nikke) => {
    const group = wishlistGroup(nikke);
    return group ? [{ nikke, group }] : [];
  });
}

// 이 시점에 쓸 수 있는 위시리스트인지. 아직 나오지 않은 니케가 끼어 있으면 다시 골라야 한다.
export function isWishlistReady(wishlist: number[], schedule: PickupBanner) {
  const available = new Map(ssrPoolAt(schedule).map((nikke) => [nikke.id, nikke]));
  return wishlistGroups.every(
    (group) =>
      wishlist.filter((id) => {
        const nikke = available.get(id);
        return nikke && wishlistGroup(nikke) === group;
      }).length === WISHLIST_PER_GROUP,
  );
}

export type Banner =
  | { kind: "normal"; schedule: PickupBanner; wishlist: number[] }
  | { kind: "pickup"; schedule: PickupBanner };

export const JEWELS_PER_PULL = 300;
export const MILEAGE_COST = 200;

// 퍼센트 단위, SSR 합계 4% (사용자 지정).
// 일반 모집: 오버스펙/필그림 1%, 그 외 SSR 3%.
// 픽업 모집: 통상 니케 픽업은 2%, 오버스펙/필그림 픽업은 필그림 몫 1%를 픽업이 전부 가져간다.
export type RateTable = { pickup: number; pilgrim: number; otherSsr: number; sr: number; r: number };

const rarityRates = { sr: 43, r: 53 };

export function isPilgrim(nikke: Nikke) {
  return nikke.manufacturer === "오버스펙/필그림";
}

export function ratesFor(banner: Banner): RateTable {
  if (banner.kind === "normal") return { pickup: 0, pilgrim: 1, otherSsr: 3, ...rarityRates };
  const pickup = ssrPool.find((nikke) => nikke.id === banner.schedule.nikkeId)!;
  return isPilgrim(pickup)
    ? { pickup: 1, pilgrim: 0, otherSsr: 3, ...rarityRates }
    : { pickup: 2, pilgrim: 1, otherSsr: 1, ...rarityRates };
}

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function drawOne(banner: Banner): Nikke {
  const roll = Math.random() * 100;
  const table = ratesFor(banner);
  const pickupId = banner.kind === "pickup" ? banner.schedule.nikkeId : null;
  let pilgrims: Nikke[];
  let others: Nikke[];
  if (banner.kind === "normal") {
    // 위시리스트 픽업: 필그림 몫은 오버스펙/필그림 칸 5명, 통상 몫은 나머지 15명에서 나온다.
    const wished = ssrPool.filter((nikke) => banner.wishlist.includes(nikke.id));
    pilgrims = wished.filter((nikke) => wishlistGroup(nikke) === "오버스펙/필그림");
    others = wished.filter((nikke) => wishlistGroup(nikke) !== "오버스펙/필그림");
  } else {
    const rest = ssrPoolAt(banner.schedule).filter((nikke) => nikke.id !== pickupId);
    pilgrims = rest.filter(isPilgrim);
    others = rest.filter((nikke) => !isPilgrim(nikke));
  }

  let edge = table.pickup;
  if (roll < edge) return ssrPool.find((nikke) => nikke.id === pickupId)!;
  edge += table.pilgrim;
  if (roll < edge) return pick(pilgrims.length ? pilgrims : others);
  edge += table.otherSsr;
  if (roll < edge) return pick(others);
  edge += table.sr;
  if (roll < edge) return pick(srPool);
  return pick(rPool);
}

export function draw(banner: Banner, count: number) {
  return Array.from({ length: count }, () => drawOne(banner));
}
