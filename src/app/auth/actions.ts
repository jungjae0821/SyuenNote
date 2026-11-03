"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured, siteUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function signInWithDiscord() {
  if (!isSupabaseConfigured) redirect("/me?error=not-configured");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: { redirectTo: `${siteUrl()}/auth/callback`, scopes: "identify" },
  });

  if (error || !data.url) redirect("/me?error=login-failed");
  redirect(data.url);
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
