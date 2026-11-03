import { randomInt } from "node:crypto";
import type { NextRequest } from "next/server";
import { fail, guard, ok } from "@/lib/api-guard";
import { type LinkStatus, parseProfileId, serverNames } from "@/lib/blablalink";
import { createAdminClient } from "@/lib/supabase/admin";

// blablalink 프로필 연결 상태. 연결은 인증코드를 자기소개에 적어 본인임을 보인 뒤에만 된다 (verify/route.ts).
const CODE_TTL_MINUTES = 30;
// 헷갈리는 글자(0/O, 1/I/L)는 뺐다.
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function newCode() {
  return `SN-${Array.from({ length: 6 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join("")}`;
}

export async function GET(request: NextRequest) {
  const user = await guard(request);
  if (user instanceof Response) return user;

  const { data, error } = await createAdminClient()
    .from("blablalink_links")
    .select("openid, area_id, code, code_expires_at, verified_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return fail(500, "db");

  let status: LinkStatus = { status: "none" };
  if (data?.verified_at) status = { status: "linked", openid: data.openid, area: data.area_id };
  else if (data?.code && new Date(data.code_expires_at) > new Date()) {
    status = {
      status: "pending",
      openid: data.openid,
      area: data.area_id,
      code: data.code,
      expiresAt: data.code_expires_at,
    };
  }
  return ok(status);
}

// 인증코드 발급. 이미 연결된 프로필이 있어도 새 프로필로 바꾸려면 다시 발급받는다.
export async function POST(request: NextRequest) {
  const user = await guard(request);
  if (user instanceof Response) return user;

  let profile: unknown;
  let area: unknown;
  try {
    ({ profile, area } = await request.json());
  } catch {
    return fail(400, "invalid");
  }
  const openid = typeof profile === "string" ? parseProfileId(profile) : null;
  if (!openid || typeof area !== "string" || !(area in serverNames)) return fail(400, "invalid");

  const code = newCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString();
  const { error } = await createAdminClient()
    .from("blablalink_links")
    .upsert({ user_id: user.id, openid, area_id: area, code, code_expires_at: expiresAt, verified_at: null });
  if (error) return fail(500, "db");

  return ok({ status: "pending", openid, area, code, expiresAt } satisfies LinkStatus);
}

export async function DELETE(request: NextRequest) {
  const user = await guard(request);
  if (user instanceof Response) return user;

  const { error } = await createAdminClient().from("blablalink_links").delete().eq("user_id", user.id);
  if (error) return fail(500, "db");
  return ok({ status: "none" } satisfies LinkStatus);
}
