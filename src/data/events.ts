// 스토리 이벤트 일정. 나무위키 "승리의 여신: 니케/이벤트 스토리" 문서의 2026년 항목을 2026-11-03에 옮겼다.
// 날짜는 한국 서버 기준 시작일과 종료일만 남겼다(시각 생략). nikkeIds는 그 이벤트의 픽업 니케다.
// 새 이벤트가 열리면 이 목록 끝에 한 줄씩 더한다.
export type StoryEvent = { title: string; kind: string; start: string; end: string; nikkeIds: number[] };

export const storyEvents: StoryEvent[] = [
  { title: "GREAT VILLAIN UNION", kind: "통상 이벤트", start: "2026-09-03", end: "2026-09-16", nikkeIds: [110401] },
  { title: "COIN RUSH SHOWDOWN", kind: "통상 이벤트", start: "2026-09-17", end: "2026-10-07", nikkeIds: [140401, 140501] },
  { title: "LITTLE WITCH TRICK", kind: "통상 이벤트", start: "2026-10-08", end: "2026-10-28", nikkeIds: [306301] },
  { title: "MOST BEAUTIFUL MAID", kind: "미니 이벤트", start: "2026-10-08", end: "2026-10-28", nikkeIds: [] },
  { title: "MARIA-n", kind: "4주년 이벤트", start: "2026-10-29", end: "2026-11-19", nikkeIds: [401901, 447201] },
];
