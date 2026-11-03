export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

// 키 없이도 `npm run dev`로 화면을 볼 수 있도록, 미설정이면 인증 기능만 끈다.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
