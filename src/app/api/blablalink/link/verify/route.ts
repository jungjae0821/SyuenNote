import type { NextRequest } from "next/server";
import { fail, guard, ok } from "@/lib/api-guard";
import { BlablalinkError, fetchRemark } from "@/lib/blablalink-server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LinkStatus } from "@/lib/blablalink";

// 발급한 인증코드가 그 프로필의 자기소개에 적혀 있으면 연결을 확정한다.
export async function POST(request: NextRequest) {
  const user = await guard(request);
  if (user instanceof Response) return user;

  const admin = createAdminClient();
  const { data: link, error } = await admin
    .from("blablalink_links")
    .select("openid, area_id, code, code_expires_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return fail(500, "db");
  if (!link?.code) return fail(400, "no-pending");
  if (new Date(link.code_expires_at) <= new Date()) return fail(400, "code-expired");

  let remark: string;
  try {
    remark = await fetchRemark(link.openid);
  } catch (caught) {
    return fail(502, caught instanceof BlablalinkError ? caught.message : "upstream");
  }
  if (!remark.includes(link.code)) return fail(400, "code-not-found");

  // 본인임을 보였으니, 같은 프로필을 먼저 연결해 둔 다른 사용자가 있으면 그 연결을 푼다.
  await admin.from("blablalink_links").delete().eq("openid", link.openid).neq("user_id", user.id);
  const { error: updateError } = await admin
    .from("blablalink_links")
    .update({ code: null, code_expires_at: null, verified_at: new Date().toISOString() })
    .eq("user_id", user.id);
  if (updateError) return fail(500, "db");

  return ok({ status: "linked", openid: link.openid, area: link.area_id } satisfies LinkStatus);
}
