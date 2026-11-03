// 역대 특수 모집(픽업) 일정. 나무위키 "승리의 여신: 니케/대원 모집" 문서의 개최 종료·개최 중·예정 표를 2026-11-03에 옮겼다.
// 날짜는 한국 서버 기준 시작일과 종료일만 남겼다(시각 생략). 콜라보 니케 이름은 nikkes.ts 표기로 바꿨다.
// 새 픽업이 열리면 이 목록 끝에 한 줄씩 더한다.
export type PickupBanner = { start: string; end: string; nikkeId: number; limited: boolean };

export const pickupBanners: PickupBanner[] = [
  { start: "2022-11-10", end: "2022-11-24", nikkeId: 235201, limited: false }, // 헬름
  { start: "2022-11-24", end: "2022-12-08", nikkeId: 110001, limited: false }, // 라플라스
  { start: "2022-12-08", end: "2022-12-28", nikkeId: 320301, limited: true }, // 루피 : 윈터 쇼퍼
  { start: "2022-12-15", end: "2022-12-28", nikkeId: 112101, limited: true }, // 앤 : 미라클 페어리
  { start: "2023-01-01", end: "2023-01-19", nikkeId: 426001, limited: false }, // 모더니아
  { start: "2023-01-12", end: "2023-01-25", nikkeId: 111101, limited: false }, // 자칼
  { start: "2023-01-19", end: "2023-01-31", nikkeId: 311201, limited: false }, // 바이퍼
  { start: "2023-02-01", end: "2023-02-15", nikkeId: 331101, limited: false }, // 코코아
  { start: "2023-02-08", end: "2023-02-21", nikkeId: 331201, limited: false }, // 소다
  { start: "2023-02-22", end: "2023-03-15", nikkeId: 580001, limited: true }, // 마키마
  { start: "2023-02-22", end: "2023-03-15", nikkeId: 580101, limited: true }, // 파워
  { start: "2023-03-15", end: "2023-03-30", nikkeId: 338101, limited: false }, // 비스킷
  { start: "2023-03-30", end: "2023-04-13", nikkeId: 328201, limited: false }, // 사쿠라
  { start: "2023-04-13", end: "2023-04-27", nikkeId: 204001, limited: false }, // D
  { start: "2023-04-13", end: "2023-04-27", nikkeId: 319101, limited: false }, // 앨리스
  { start: "2023-04-27", end: "2023-05-18", nikkeId: 423301, limited: false }, // 도로시
  { start: "2023-05-18", end: "2023-06-01", nikkeId: 327001, limited: false }, // 블랑
  { start: "2023-05-25", end: "2023-06-08", nikkeId: 327101, limited: false }, // 누아르
  { start: "2023-06-01", end: "2023-06-15", nikkeId: 228001, limited: false }, // 로산나
  { start: "2023-06-15", end: "2023-07-06", nikkeId: 313201, limited: true }, // 메어리 : 베이 갓데스
  { start: "2023-06-22", end: "2023-07-13", nikkeId: 201401, limited: true }, // 네온 : 블루 오션
  { start: "2023-07-06", end: "2023-07-20", nikkeId: 338001, limited: false }, // 네로
  { start: "2023-07-20", end: "2023-08-03", nikkeId: 235001, limited: false }, // 마스트
  { start: "2023-08-03", end: "2023-08-24", nikkeId: 301501, limited: true }, // 아니스 : 스파클링 서머
  { start: "2023-08-10", end: "2023-08-31", nikkeId: 235301, limited: true }, // 헬름 : 아쿠아마린
  { start: "2023-09-01", end: "2023-09-28", nikkeId: 581001, limited: true }, // 2B
  { start: "2023-09-08", end: "2023-09-28", nikkeId: 581101, limited: true }, // A2
  { start: "2023-09-21", end: "2023-10-05", nikkeId: 232101, limited: false }, // 마르차나
  { start: "2023-10-05", end: "2023-10-19", nikkeId: 145001, limited: false }, // 나가
  { start: "2023-10-12", end: "2023-10-26", nikkeId: 145101, limited: false }, // 티아
  { start: "2023-10-19", end: "2023-11-01", nikkeId: 203301, limited: false }, // 키리
  { start: "2023-11-02", end: "2023-11-23", nikkeId: 447001, limited: false }, // 레드 후드
  { start: "2023-11-23", end: "2023-12-07", nikkeId: 119201, limited: false }, // 토브
  { start: "2023-12-07", end: "2023-12-28", nikkeId: 319401, limited: true }, // 루드밀라 : 윈터 오너
  { start: "2023-12-14", end: "2023-12-31", nikkeId: 306201, limited: true }, // 미카 : 스노우 버디
  { start: "2024-01-01", end: "2024-01-18", nikkeId: 422501, limited: false }, // 홍련 : 흑영
  { start: "2024-01-01", end: "2024-01-18", nikkeId: 426001, limited: false }, // 모더니아
  { start: "2024-01-11", end: "2024-01-25", nikkeId: 338201, limited: false }, // 레오나
  { start: "2024-01-25", end: "2024-02-08", nikkeId: 328101, limited: false }, // 목단
  { start: "2024-02-05", end: "2024-02-22", nikkeId: 231301, limited: false }, // 프리바티 : 언카인드 메이드
  { start: "2024-02-15", end: "2024-02-29", nikkeId: 331001, limited: false }, // 에이드
  { start: "2024-02-22", end: "2024-03-06", nikkeId: 150001, limited: false }, // 일레그
  { start: "2024-03-07", end: "2024-03-20", nikkeId: 204301, limited: false }, // D : 킬러 와이프
  { start: "2024-03-21", end: "2024-04-11", nikkeId: 582101, limited: true }, // 에밀리아
  { start: "2024-03-28", end: "2024-04-11", nikkeId: 582001, limited: true }, // 렘
  { start: "2024-04-11", end: "2024-04-24", nikkeId: 355001, limited: false }, // 베이
  { start: "2024-04-25", end: "2024-05-16", nikkeId: 433001, limited: false }, // 크라운
  { start: "2024-05-16", end: "2024-05-30", nikkeId: 150101, limited: false }, // 트로니
  { start: "2024-05-30", end: "2024-06-20", nikkeId: 331401, limited: false }, // 소다 : 트윙클링 바니
  { start: "2024-06-06", end: "2024-06-27", nikkeId: 319501, limited: false }, // 앨리스 : 원더랜드 바니
  { start: "2024-06-20", end: "2024-07-03", nikkeId: 355101, limited: false }, // 클레이
  { start: "2024-07-04", end: "2024-07-25", nikkeId: 328401, limited: true }, // 사쿠라 : 블룸 인 서머
  { start: "2024-07-04", end: "2024-07-25", nikkeId: 313201, limited: true }, // 메어리 : 베이 갓데스
  { start: "2024-07-04", end: "2024-07-25", nikkeId: 201401, limited: true }, // 네온 : 블루 오션
  { start: "2024-07-11", end: "2024-08-01", nikkeId: 328301, limited: true }, // 로산나 : 시크 오션
  { start: "2024-07-25", end: "2024-08-08", nikkeId: 139101, limited: false }, // 아인
  { start: "2024-07-25", end: "2024-08-15", nikkeId: 301501, limited: true }, // 아니스 : 스파클링 서머
  { start: "2024-07-25", end: "2024-08-15", nikkeId: 235301, limited: true }, // 헬름 : 아쿠아마린
  { start: "2024-08-08", end: "2024-08-21", nikkeId: 239001, limited: false }, // 츠바이
  { start: "2024-08-22", end: "2024-09-19", nikkeId: 583001, limited: true }, // 아스카
  { start: "2024-08-29", end: "2024-09-19", nikkeId: 583101, limited: true }, // 레이
  { start: "2024-09-05", end: "2024-09-19", nikkeId: 583201, limited: true }, // 마리
  { start: "2024-09-19", end: "2024-10-03", nikkeId: 327201, limited: false }, // 루주
  { start: "2024-10-03", end: "2024-10-17", nikkeId: 140301, limited: false }, // 퀀시 : 이스케이프 퀸
  { start: "2024-10-10", end: "2024-10-24", nikkeId: 258001, limited: false }, // 팬텀
  { start: "2024-10-17", end: "2024-10-30", nikkeId: 324001, limited: false }, // 루마니
  { start: "2024-10-31", end: "2024-11-21", nikkeId: 451101, limited: false }, // 신데렐라
  { start: "2024-11-07", end: "2024-11-28", nikkeId: 451401, limited: false }, // 그레이브
  { start: "2024-11-21", end: "2024-12-05", nikkeId: 141101, limited: false }, // 플로라
  { start: "2024-12-05", end: "2024-12-26", nikkeId: 218301, limited: true }, // 메이든 : 아이스 로즈
  { start: "2024-12-05", end: "2024-12-26", nikkeId: 319401, limited: true }, // 루드밀라 : 윈터 오너
  { start: "2024-12-05", end: "2024-12-26", nikkeId: 306201, limited: true }, // 미카 : 스노우 버디
  { start: "2024-12-12", end: "2024-12-31", nikkeId: 218201, limited: true }, // 길로틴 : 윈터 슬레이어
  { start: "2025-01-01", end: "2025-01-23", nikkeId: 201601, limited: false }, // 라피 : 레드 후드
  { start: "2025-01-01", end: "2025-01-23", nikkeId: 422501, limited: false }, // 홍련 : 흑영
  { start: "2025-01-16", end: "2025-01-30", nikkeId: 129001, limited: false }, // 마나
  { start: "2025-01-30", end: "2025-02-19", nikkeId: 235401, limited: false }, // 마스트 : 로망틱 메이드
  { start: "2025-02-06", end: "2025-02-27", nikkeId: 235501, limited: false }, // 앵커 : 이노센트 메이드
  { start: "2025-02-20", end: "2025-03-13", nikkeId: 583501, limited: true }, // 아스카 : WILLE
  { start: "2025-02-20", end: "2025-03-13", nikkeId: 583001, limited: true }, // 아스카
  { start: "2025-02-27", end: "2025-03-13", nikkeId: 583401, limited: true }, // 레이 (가칭)
  { start: "2025-02-27", end: "2025-03-13", nikkeId: 583101, limited: true }, // 레이
  { start: "2025-02-27", end: "2025-03-13", nikkeId: 583201, limited: true }, // 마리
  { start: "2025-03-13", end: "2025-03-27", nikkeId: 141201, limited: false }, // 트리나
  { start: "2025-03-27", end: "2025-04-10", nikkeId: 352001, limited: false }, // 브래디
  { start: "2025-04-10", end: "2025-04-23", nikkeId: 352101, limited: false }, // 크러스트
  { start: "2025-04-24", end: "2025-05-15", nikkeId: 451301, limited: false }, // 리틀 머메이드
  { start: "2025-05-01", end: "2025-05-22", nikkeId: 116201, limited: false }, // 미하라 : 본딩 체인
  { start: "2025-05-15", end: "2025-05-29", nikkeId: 258101, limited: false }, // 아르카나
  { start: "2025-05-29", end: "2025-06-11", nikkeId: 204101, limited: false }, // K
  { start: "2025-06-12", end: "2025-07-10", nikkeId: 585001, limited: true }, // 이브
  { start: "2025-06-19", end: "2025-07-10", nikkeId: 585101, limited: true }, // 레이븐
  { start: "2025-07-03", end: "2025-07-17", nikkeId: 253201, limited: false }, // 소라
  { start: "2025-07-03", end: "2025-07-31", nikkeId: 581001, limited: true }, // 2B
  { start: "2025-07-10", end: "2025-07-31", nikkeId: 581101, limited: true }, // A2
  { start: "2025-07-17", end: "2025-08-07", nikkeId: 423401, limited: true }, // 도로시 : 세렌디피티
  { start: "2025-07-24", end: "2025-08-14", nikkeId: 150201, limited: true }, // 일레그 : 붐 앤 쇼크
  { start: "2025-07-24", end: "2025-08-14", nikkeId: 328401, limited: true }, // 사쿠라 : 블룸 인 서머
  { start: "2025-07-24", end: "2025-08-14", nikkeId: 328301, limited: true }, // 로산나 : 시크 오션
  { start: "2025-08-07", end: "2025-09-04", nikkeId: 209301, limited: false }, // 엠마 : 택티컬 업
  { start: "2025-08-14", end: "2025-09-04", nikkeId: 209501, limited: false }, // 은화 : 택티컬 업
  { start: "2025-08-21", end: "2025-09-11", nikkeId: 209401, limited: false }, // 베스티 : 택티컬 업
  { start: "2025-09-04", end: "2025-09-23", nikkeId: 331501, limited: false }, // 에이드 : 에이전트 바니
  { start: "2025-09-11", end: "2025-10-02", nikkeId: 314301, limited: false }, // 밀크 : 블루밍 바니
  { start: "2025-09-24", end: "2025-10-21", nikkeId: 584001, limited: true }, // 에이다
  { start: "2025-10-02", end: "2025-10-21", nikkeId: 584101, limited: true }, // 질
  { start: "2025-10-16", end: "2025-10-29", nikkeId: 502301, limited: false }, // 델타 : 닌자 시프
  { start: "2025-10-30", end: "2025-11-20", nikkeId: 422301, limited: false }, // 나유타
  { start: "2025-11-06", end: "2025-11-27", nikkeId: 426201, limited: false }, // 리버렐리오
  { start: "2025-11-20", end: "2025-12-04", nikkeId: 207401, limited: false }, // 솔린 : 프로스트 티켓
  { start: "2025-12-04", end: "2025-12-25", nikkeId: 207501, limited: true }, // 디젤 : 윈터 스위츠
  { start: "2025-12-04", end: "2025-12-25", nikkeId: 218301, limited: true }, // 메이든 : 아이스 로즈
  { start: "2025-12-04", end: "2025-12-25", nikkeId: 218201, limited: true }, // 길로틴 : 윈터 슬레이어
  { start: "2025-12-11", end: "2025-12-31", nikkeId: 207301, limited: true }, // 브리드 : 사일런트 트랙
  { start: "2026-01-01", end: "2026-01-22", nikkeId: 447101, limited: false }, // 스노우 화이트 : 헤비암즈
  { start: "2026-01-01", end: "2026-01-22", nikkeId: 201601, limited: false }, // 라피 : 레드 후드
  { start: "2026-01-15", end: "2026-01-29", nikkeId: 258201, limited: false }, // 레이블
  { start: "2026-01-29", end: "2026-02-11", nikkeId: 331601, limited: false }, // 벨벳
  { start: "2026-02-12", end: "2026-03-12", nikkeId: 586001, limited: true }, // 치사토
  { start: "2026-02-19", end: "2026-03-12", nikkeId: 586101, limited: true }, // 타키나
  { start: "2026-03-05", end: "2026-03-19", nikkeId: 211301, limited: false }, // E.H.
  { start: "2026-03-19", end: "2026-04-09", nikkeId: 258301, limited: false }, // 아르카나 : 포츈 메이트
  { start: "2026-04-09", end: "2026-04-22", nikkeId: 162001, limited: false }, // 백학
  { start: "2026-04-23", end: "2026-05-14", nikkeId: 301701, limited: false }, // 아니스 : 스타
  { start: "2026-04-30", end: "2026-05-21", nikkeId: 101801, limited: false }, // 네온 : 비전 아이
  { start: "2026-05-14", end: "2026-06-04", nikkeId: 360001, limited: false }, // 민트
  { start: "2026-05-28", end: "2026-06-11", nikkeId: 360101, limited: false }, // 프리카
  { start: "2026-06-11", end: "2026-07-02", nikkeId: 357001, limited: false }, // 아크레인저 블랙
  { start: "2026-07-02", end: "2026-07-23", nikkeId: 451501, limited: true }, // 신데렐라 : 크리스탈 웨이브
  { start: "2026-07-09", end: "2026-07-30", nikkeId: 232201, limited: true }, // 마르차나 : 마린 스터디
  { start: "2026-07-23", end: "2026-08-12", nikkeId: 110301, limited: false }, // 라플라스 : 얼티밋 히어로
  { start: "2026-07-30", end: "2026-08-20", nikkeId: 110501, limited: false }, // 맥스웰 : 오디너리 미케닉
  { start: "2026-08-13", end: "2026-09-10", nikkeId: 587001, limited: true }, // 퀸(마코토)
  { start: "2026-08-20", end: "2026-09-10", nikkeId: 587101, limited: true }, // 유키코
  { start: "2026-09-03", end: "2026-09-17", nikkeId: 110401, limited: false }, // 드레이크 : 그레이트 빌런
  { start: "2026-09-17", end: "2026-10-08", nikkeId: 140401, limited: false }, // 길티 : 마이티 바니
  { start: "2026-09-24", end: "2026-10-15", nikkeId: 140501, limited: false }, // 신 : 스위프트 바니
  { start: "2026-10-08", end: "2026-10-28", nikkeId: 306301, limited: false }, // 벨로타 : 펌킨 위치
  { start: "2026-10-29", end: "2026-11-19", nikkeId: 401901, limited: false }, // 마리안 : 퀸
  { start: "2026-11-05", end: "2026-11-26", nikkeId: 447201, limited: false }, // 홍련 : 신살
];
