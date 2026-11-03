import "server-only";
import { isSupabaseConfigured } from "./supabase/env";
import { createClient } from "./supabase/server";

export type User = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

// 로그인하지 않았거나 Supabase가 설정되지 않았으면 null.
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const meta = data.user.user_metadata as Record<string, string | undefined>;
  return {
    id: data.user.id,
    name: meta.full_name ?? meta.name ?? meta.user_name ?? "지휘관",
    avatarUrl: meta.avatar_url ?? null,
  };
}
