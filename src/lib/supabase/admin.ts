import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

// RLS를 건너뛰는 secret key 클라이언트. 인증 확인처럼 사용자가 직접 쓰면 안 되는 값을 쓸 때만 서버에서 쓴다.
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) throw new Error("SUPABASE_SECRET_KEY가 설정되지 않았습니다.");
  return createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
