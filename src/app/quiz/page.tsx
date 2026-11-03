import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "이름 맞추기 퀴즈" };

export default function QuizPage() {
  return (
    <ComingSoon
      title="이름 맞추기 퀴즈"
      summary="실루엣이나 일러스트를 보고 니케 이름을 맞춥니다."
      features={["쉬움: 4지선다", "어려움: 이름 직접 입력, 자동완성 지원", "로그인하면 점수와 기록을 계정에 저장"]}
    />
  );
}
