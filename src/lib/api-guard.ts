import "server-only";
import type { NextRequest } from "next/server";
import { getCurrentUser, type User } from "./auth";

const noStore = { "Cache-Control": "no-store" };

export function fail(status: number, error: string) {
  return Response.json({ error }, { status, headers: noStore });
}

export function ok(body: unknown) {
  return Response.json(body, { headers: noStore });
}

// 내 정보 API 공통 검사. 다른 사이트가 중계 서버로 쓰지 못하게 같은 출처만, 그리고 로그인한 사용자만 받는다.
export async function guard(request: NextRequest): Promise<User | Response> {
  if (request.method !== "GET" && request.headers.get("origin") !== request.nextUrl.origin) {
    return fail(403, "forbidden");
  }
  return (await getCurrentUser()) ?? fail(401, "login-required");
}
