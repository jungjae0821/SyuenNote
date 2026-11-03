import { signInWithDiscord } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { UserMenu } from "./user-menu";

export async function UserButton() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <form action={signInWithDiscord}>
        <button className="h-11 rounded-lg bg-ink px-3.5 text-sm font-extrabold text-ground transition-opacity hover:opacity-85">
          디스코드로 로그인
        </button>
      </form>
    );
  }

  return <UserMenu user={user} />;
}
