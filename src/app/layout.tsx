import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/site-header";
import { TabBar } from "@/components/tab-bar";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "슈엔노트", template: "%s | 슈엔노트" },
  description: "승리의 여신: 니케 팬 도구 모음. 니케 도감, 가챠 시뮬레이터, 이름 맞추기 퀴즈, 내 정보 불러오기.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <div className="flex-1 pb-24 md:pb-0">{children}</div>
        <footer className="px-4 pt-10 pb-28 text-center text-xs leading-relaxed text-ink-2 md:px-10 md:pb-10">
          슈엔노트는 팬이 만든 비공식 사이트이며 SHIFT UP, Level Infinite와 관련이 없습니다.
          <br />
          게임에 등장하는 이름과 이미지의 권리는 각 권리자에게 있습니다.
        </footer>
        <TabBar />
      </body>
    </html>
  );
}
