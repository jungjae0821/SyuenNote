import type { NextRequest } from "next/server";
import { fail, guard, ok } from "@/lib/api-guard";
import { BlablalinkError, fetchGameProfile } from "@/lib/blablalink-server";
import { createAdminClient } from "@/lib/supabase/admin";

// 인증을 마친 내 프로필의 게임 정보를 운영 계정 세션으로 불러온다.
// 사용자 쿠키는 받지 않는다. 다른 사람 프로필은 조회할 수 없다(요청에 ID를 받지 않는다).
export async function POST(request: NextRequest) {
  const user = await guard(request);
  if (user instanceof Response) return user;

  const { data: link, error } = await createAdminClient()
    .from("blablalink_links")
    .select("openid, area_id, verified_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return fail(500, "db");
  if (!link?.verified_at) return fail(400, "not-linked");

  try {
    return ok({ openid: link.openid, profile: await fetchGameProfile(link.openid, link.area_id) });
  } catch (caught) {
    const reason = caught instanceof BlablalinkError ? caught.message : "upstream";
    return fail(reason === "no-game-account" ? 404 : 502, reason);
  }
}
