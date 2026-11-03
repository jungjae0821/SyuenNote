import type { NextRequest } from "next/server";
import { nikkeIdByNameCode } from "@/data/name-codes";
import { fail, guard, ok } from "@/lib/api-guard";
import { BlablalinkError, fetchNikkeDetail } from "@/lib/blablalink-server";
import { createAdminClient } from "@/lib/supabase/admin";

// 너무 자주 부르면 blablalink가 1300015를 돌려준다. 사용자마다, 그리고 운영 계정 전체로 간격을 둔다.
// 서버 인스턴스 메모리에만 있어서 인스턴스가 여러 개면 각자 센다.
const USER_INTERVAL = 2_000;
const GLOBAL_INTERVAL = 500;
const MAX_WAIT = 6_000;
const lastByUser = new Map<string, number>();
let lastGlobal = 0;

// 인증을 마친 내 프로필에서 니케 한 명의 상세를 불러온다. 프로필 ID는 받지 않고 name_code 하나만 받는다.
export async function POST(request: NextRequest) {
  const user = await guard(request);
  if (user instanceof Response) return user;

  const body = (await request.json().catch(() => null)) as { nameCode?: unknown } | null;
  const nameCode = body?.nameCode;
  if (typeof nameCode !== "number" || !Number.isInteger(nameCode) || !nikkeIdByNameCode[nameCode]) {
    return fail(400, "invalid");
  }

  // 간격 안에 들어온 요청은 거절하지 않고 차례가 올 때까지 기다린다. 너무 오래 밀리면 그때만 거절한다.
  const now = Date.now();
  const slot = Math.max(now, (lastByUser.get(user.id) ?? 0) + USER_INTERVAL, lastGlobal + GLOBAL_INTERVAL);
  if (slot - now > MAX_WAIT) return fail(429, "too-frequent");
  lastByUser.set(user.id, slot);
  lastGlobal = slot;
  if (slot > now) await new Promise((resolve) => setTimeout(resolve, slot - now));

  const { data: link, error } = await createAdminClient()
    .from("blablalink_links")
    .select("openid, area_id, verified_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return fail(500, "db");
  if (!link?.verified_at) return fail(400, "not-linked");

  try {
    return ok({ detail: await fetchNikkeDetail(link.openid, link.area_id, nameCode) });
  } catch (caught) {
    const reason = caught instanceof BlablalinkError ? caught.message : "upstream";
    const status = reason === "not-owned" ? 404 : reason === "too-frequent" ? 429 : 502;
    return fail(status, reason);
  }
}
