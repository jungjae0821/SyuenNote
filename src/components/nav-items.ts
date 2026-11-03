export const navItems = [
  { href: "/dex", label: "도감" },
  { href: "/gacha", label: "가챠" },
  { href: "/quiz", label: "퀴즈" },
  { href: "/me", label: "내 정보" },
] as const;

export type NavHref = (typeof navItems)[number]["href"];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
