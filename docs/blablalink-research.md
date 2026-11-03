# blablalink 연동 조사

조사일: 2026-11-03. 비로그인 상태의 브라우저에서 blablalink.com을 열고 네트워크 요청을 확인했다. 계정 로그인이나 토큰 입력은 하지 않았다.

## 요약

| 항목 | 결론 |
|---|---|
| (a) 전체 니케 데이터 | **가능.** 비로그인으로 받는 공개 CDN JSON에 플레이어블 니케 206명의 기본 정보가 있다. |
| (a) 니케 이미지 | **기술적으로는 가능, 권리상 위험.** 이미지 URL은 해시 경로라서 규칙으로 만들 수 없다. 게다가 공식 일러스트를 그대로 재배포하는 것은 가이드라인상 2차 창작으로 인정되지 않는다. |
| (b) 내 정보 | **우리 서버에서 대신 가져오는 방식은 권장하지 않음.** 게임 정보 API는 blablalink(Level Infinite) 로그인 세션 쿠키가 필요하다. 이 쿠키를 우리 사이트가 받아 쓰는 것은 계정 공유와 무허가 제3자 프로그램 금지 조항에 걸릴 수 있다. |
| UID 조회 | 확인하지 못함. 비로그인 상태에서 UID만으로 다른 사람 정보를 보는 공개 엔드포인트는 찾지 못했다. 로그인한 사용자의 ShiftyPad 공유 링크 구조는 로그인이 필요해 확인하지 않았다(아래 "남은 확인" 참고). |
| 공개 배포 리스크 | 가장 큰 리스크는 시프트업 2차 창작 가이드라인 제3조 3항("게임 IP를 활용하여 게임을 제작하고 배포 및 서비스하는 것은 원칙적으로 허용되지 않습니다")과 영리 목적 금지(제2조 1항)다. |

## 1. 확인한 네트워크 구조

### 호스트

- `www.blablalink.com`: 웹 프론트(Vue SPA). 페이지 경로 예: `/shiftyspad/nikke-list` (니케 도감).
- `api.blablalink.com`: 커뮤니티와 게임 API. 모두 `POST`, JSON 응답 `{ code, code_type, msg, data, seq }`.
- `sg-tools-cdn.blablalink.com`: 게임 테이블을 JSON으로 덤프한 정적 파일과 이미지(webp). **비로그인으로 읽힌다.**
- `sg-cdn.blablalink.com`: 커뮤니티 게시물 이미지.
- `sg-community.playerinfinite.com`, `sg-lipcommunity.playerinfinite.com`: Level Infinite 공통 커뮤니티 백엔드와 설정.

### 니케 도감 페이지가 부르는 요청

```
GET  sg-tools-cdn.blablalink.com/wi-97/ni-77/ffc69c4074f27bc772acbe869127e616.json   # 캐릭터 목록 (137KB)
GET  sg-tools-cdn.blablalink.com/ug-00/452950b7851009edecb261bf5ee0c236.json         # 스파인/리소스 id 매핑
GET  sg-tools-cdn.blablalink.com/yd-43/uk-21/e48b7fc4edf17ed3c77f804cd13e5e99.json   # 애니메이션 이름
GET  sg-tools-cdn.blablalink.com/ci-45/8a0c7d05a50eb17f8c41ee05f84e1ecf.json         # 버프 설명
POST api.blablalink.com/api/lip/direct/commodity/Game/GetRegionList
POST api.blablalink.com/api/game/proxy/Tools/GetNikkesOrder
GET  api.blablalink.com/api/game/proxy/Game/GetSavedRoleInfo                         # 로그인 필요
```

홈 화면에서는 메인 스토리 스테이지(853KB), 트라이브 타워(905KB), 스토리 도감(259KB) JSON도 같은 CDN에서 받는다.

파일 경로가 해시라서 **게임 업데이트 때 경로가 바뀔 수 있다.** 경로는 프론트 번들(`/assets/nikke/version/default/assets/index-*.js`)에 들어 있다고 보는 것이 자연스럽지만, 번들 안의 위치는 확인하지 않았다.

### 캐릭터 목록 JSON

- 206개 항목, 모두 `is_visible: true`.
- 필드: `id, resource_id, order, original_rare, class, use_burst_skill, name_code, grade_core_id, corporation, is_visible, name_localkey, element_id, shot_id, costumes`
- 값 범위
  - `original_rare`: SSR, SR, R
  - `class`: Attacker, Defender, Supporter
  - `use_burst_skill`: Step1, Step2, Step3, AllStep (= 버스트 I, II, III, 전 단계)
  - `corporation`: ELYSION, MISSILIS, TETRA, PILGRIM, ABNORMAL(콜라보)
  - `element_id.element.element`: Fire 등 코드
  - `shot_id.element.weapon_type`: MG 등 무기 종류
- `name_localkey.name`은 **요청한 언어(한국어)로 이미 풀려 있다.** 예: 엠마, 라피 : 레드 후드.
- 목록에 슈엔은 없다. 슈엔은 플레이어블 니케가 아니다.

예시(엠마, 일부):

```json
{ "id": 209001, "resource_id": 90, "original_rare": "SSR", "class": "Supporter",
  "use_burst_skill": "Step1", "corporation": "ELYSION",
  "name_localkey": { "name": "엠마" },
  "element_id": { "element": { "element": "Fire" } },
  "shot_id": { "element": { "weapon_type": "MG" } } }
```

### 이미지

- 도감 카드 이미지는 `sg-tools-cdn.blablalink.com/dt-85/rc-54/<md5>.webp` 같은 해시 경로다. `resource_id`로 URL을 바로 만들 수 없다. 해시 규칙은 프론트 코드를 뜯어봐야 알 수 있는데, 그것은 이용약관의 역설계 금지 조항에 가깝다.
- 제조사 아이콘 같은 UI 에셋은 `www.blablalink.com/assets/nikke/version/default/shiftysassets/images/...` 아래에 있다.

### 내 정보 API

- `GET /api/game/proxy/Game/GetSavedRoleInfo`를 쿠키 없이 부르면 `{"code":300001,"msg":"game not login"}`가 온다. 게임 계정 정보는 blablalink 로그인(LEVEL INFINITE PASS) 세션이 있어야 한다.
- 비로그인 상태에서도 `CheckLogin`, `server_timestamp`, 게시물 목록 API는 응답한다.
- 인증은 헤더가 아니라 `.blablalink.com` 쿠키로 간다(요청에 Authorization 헤더 없음). 웹은 `x-channel-type: 2`, `x-language`, `x-common-params`(JSON) 헤더를 함께 보낸다 (2026-11-03 확인).

## 2. 이용약관과 저작권

### 시프트업 2차 창작활동 가이드라인 (24/3/27 업데이트)

원문: https://policy.shiftup.co.kr/ip/kr/index.html (nikke-kr.com 공지에도 게시)

슈엔노트와 관련된 조항:

- **제1조 4항**: 오리지널 콘텐츠를 있는 그대로 복사하는 것은 2차 창작으로 보지 않는다. 공식 일러스트를 각색 없이 쓰는 것도 예시로 들고 있다.
- **제2조 1항**: 2차 창작물을 영리 목적으로 쓰면 안 된다. 광고나 후원 수익은 YouTube, Twitch 같은 플랫폼에 올린 경우만 예외다.
- **제3조 1항**: 팬 활동 외의 목적으로 공개·배포할 수 없다.
- **제3조 3항**: 게임 IP로 게임을 만들어 배포·서비스하는 것은 원칙적으로 허용되지 않는다.
- **제4조 2항 e**: 공식 콘텐츠로 오인되거나 제휴 관계로 보이게 하면 안 된다.
- **제5조**: 공개할 때 원작(시프트업, 게임 이름)을 밝혀야 한다.
- 문의: ugc@shiftup.co.kr

### 게임 EULA (nikke-kr.com/termsofservice, 2025-10-23 개정)

- **7항 (g)**: 서비스나 콘텐츠의 역설계, 데이터마이닝, 2차적 저작물 제작 시도를 금지한다.
- **7항 (b), (c)**: 서비스와 주고받는 통신을 가로채거나 게임 정보를 수집하는 무허가 제3자 프로그램, 부가 서비스 제공을 금지한다.
- **계정 공유 금지**: 계정 접근 권한을 다른 사람에게 줄 수 없다. 사용자가 blablalink 쿠키나 토큰을 우리 사이트에 넘기는 방식이 여기에 걸린다.

blablalink 자체 이용약관은 이번 조사에서 찾지 못했다. 사이트 하단에는 개인정보처리방침과 쿠키 정책만 링크되어 있다.

### 리스크 정리

| 기능 | 리스크 | 이유 |
|---|---|---|
| 니케 도감 (이름, 제조사, 등급, 클래스, 버스트, 무기) | 낮음~중간 | 사실 정보 위주. 다만 공개 JSON을 자동으로 긁어 오는 것은 "데이터마이닝"으로 해석될 여지가 있다. |
| 공식 일러스트·스탠딩 이미지 재배포 | **높음** | 제1조 4항상 2차 창작이 아니다. 핫링크도 결국 공식 에셋을 그대로 보여 주는 것이다. |
| 가챠 시뮬레이터 | **중간~높음** | 제3조 3항("게임 제작·배포·서비스 원칙적 불허")에 걸릴 수 있다. 다만 비슷한 팬 시뮬레이터(nikkehub 등)가 이미 운영 중이라는 점은 참고 사항일 뿐 허락의 근거가 아니다. |
| 이름 맞추기 퀴즈 | 중간 | 퀴즈도 "게임"으로 볼 수 있다. 실루엣은 공식 이미지를 가공한 것이라 이미지 리스크도 함께 진다. |
| 내 정보 (blablalink 쿠키 대행) | **높음** | 계정 공유와 무허가 제3자 프로그램 금지. 사용자 계정 정지 위험이 사용자에게 간다. |
| 광고·후원 수익 | **높음** | 제2조 1항 영리 목적 금지. |

이 문서는 법률 자문이 아니다. 공개 전에 ugc@shiftup.co.kr로 사이트 구성을 설명하고 허락 범위를 묻는 것을 권한다.

## 3. 권장 방식

### (a) 니케 데이터

1. **빌드 타임 수집 + 직접 검수.** 캐릭터 목록 JSON을 개발자가 수동 스크립트로 한 번 받아, 필요한 필드(이름, 제조사, 등급, 클래스, 버스트, 무기, 속성)만 우리 형식으로 정리해 Supabase `nikkes` 테이블(또는 `src/data/nikkes.json`)에 넣는다. 런타임에 blablalink를 부르지 않는다.
   - 업데이트 때마다 수동으로 다시 받고 차이를 검토한다. 자동 크롤러를 상시로 돌리지 않는다.
   - 해시 경로가 바뀌면 브라우저 개발자 도구에서 새 경로를 확인한다. 번들 역분석은 하지 않는다.
2. **이미지는 직접 재배포하지 않는다.** 순서대로 검토:
   - 이미지 없이 이름·속성·제조사 색으로 구성 (현재 홈 화면 방식, 리스크 최소)
   - 직접 그린 팬아트나 SD, 허락받은 작가의 팬아트 사용
   - 시프트업 허락을 받은 뒤 공식 이미지 사용
   - 실루엣 퀴즈는 허락 전까지 보류하거나, 허락받은 팬아트로 실루엣을 만든다.

### (b) 내 정보

1. **1차: 사용자가 직접 입력.** 보유 니케와 계정 정보를 사용자가 체크리스트로 고르거나 UID, 닉네임만 적게 한다. blablalink에 접속하지 않으므로 약관 리스크가 없다.
2. **2차: 사용자가 내보낸 데이터 붙여넣기.** blablalink에 공식 공유·내보내기 기능이 있다면, 사용자가 자기 브라우저에서 받은 결과를 붙여넣게 한다. 공식 기능 여부는 로그인 상태에서 확인이 필요하다.
3. **사용자 결정 (2026-11-03): 프로필 ID로 공개 게임 정보를 불러온다.** 처음에는 쿠키 붙여넣기 프록시를 만들었다가 같은 날 이 방식으로 바꾸고 쿠키 경로는 지웠다.
   - blablalink 공개 프로필 페이지(`/user?openid=<base64>`)는 비로그인 상태에서도 `POST /api/ugc/direct/standalonesite/User/GetUserGamePlayerInfo`에 `{"intl_openid": "29080-..."}`를 보낸다. 게임 계정이 없거나 공개되지 않으면 `code 103001 "MetaData no user account"`가 온다.
   - `src/app/api/blablalink/player/route.ts`가 같은 요청을 한 번 보낸다. 쿠키나 토큰은 받지 않는다. 같은 출처, 우리 사이트 로그인 사용자만 쓸 수 있다.
   - 성공 응답의 필드 이름은 아직 확인하지 못했다. 다른 사람 프로필을 여러 개 조회해 보는 것은 하지 않았다. 사용자가 본인 ID로 확인한 뒤 `src/app/me/blablalink-import.tsx`의 필드 목록을 좁힌다.
   - 서버 `area_id`: 83 한국, 81 일본, 84 글로벌, 82 북미, 85 동남아 (`GetRegionList`).
   - **확인 결과 (2026-11-03, 사용자 본인 프로필로):** 공개 설정(`GetUserPrivacySetting`)에서 `show_nikke_info`, `show_my_game_card`가 모두 1(공개)인데도, blablalink 자체 페이지가 비로그인 상태에서 `GetUserGamePlayerInfo`로 103001을 받는다. 프로필 화면에도 게임 카드가 없고, `/shiftyspad/home`은 "로그인하여 게임 데이터를 확인하세요"만 보인다. 즉 **보는 사람이 로그인하지 않으면 게임 정보는 나오지 않는다.** 프로필 ID만으로 서버가 게임 정보를 받는 방식은 동작하지 않는다.
   - 비로그인으로 받을 수 있는 것은 `GetUserProfile`의 blablalink 닉네임(`username`), 아바타, 자기소개(`remark`) 정도다.
4. **사용자 결정 (2026-11-03): 인증코드 + 운영 계정 세션.**
   - 본인 확인: 슈엔노트가 `SN-XXXXXX` 코드를 발급하고, 사용자가 blablalink 자기소개에 적으면 `GetUserProfile`의 `remark`로 확인한다 (`src/app/api/blablalink/link/`). 연결은 Supabase `blablalink_links`에 둔다.
   - 게임 정보: 슈엔노트 운영용 blablalink 계정 세션으로 인증된 본인 프로필만 조회한다 (`src/app/api/blablalink/player/route.ts`). 요청에 프로필 ID를 받지 않아 남의 프로필은 조회할 수 없다.
   - 세션 보관: AES-256-GCM 암호문만 `bot_sessions`에 둔다. 키(`SESSION_ENCRYPTION_KEY`)는 환경 변수에만 있고, 요청마다 메모리에서만 푼다 (`src/lib/session-crypto.ts`, `scripts/set-bot-session.mjs`).
   - **전제 미확인:** 로그인한 계정이 다른 사람 프로필의 게임 정보를 볼 수 있어야 동작한다. 아직 확인하지 못했다.
   - 리스크: 운영 계정으로 자동 조회하는 것은 EULA 7항(무허가 데이터 수집 도구)에 걸릴 수 있고, 운영 계정이 정지되면 기능이 멈춘다. 세션이 만료되면 운영자가 스크립트로 다시 넣어야 한다.
   - 참고 사례 (2026-11-03): Let's Doro(https://letsdoro.com/sitemap/guide?tab=blabla-auth)가 같은 흐름이다. 프로필 ID(20자 안팎, 인게임 UID 아님) + **게임 서버 선택** → 인증코드를 상태메시지에 저장(반영까지 최대 2분 30초) → 시프티패드 숨김 설정 4개(게임 카드, 전초기지, 나의 니케, 유니온)를 "모두에게 공개" → "정보 동기화". 어떤 API와 세션을 쓰는지는 공개되어 있지 않다. 이를 따라 서버 선택(`area_id`)을 추가했다.
   - 본인 프로필로 `GetUserGamePlayerInfo`에 `x-common-params`의 `game_id`/`intl_game_id`/`area_id`를 바꿔 넣어 봐도 비로그인은 계속 103001이었다. 게임 정보는 다른 API일 가능성이 있다. 로그인 상태의 시프티패드 화면 네트워크 요청 이름으로 확인해야 한다.
   - **시프티패드 게임 정보 API (2026-11-03, 사용자 크롬 로그인 상태에서 본인 계정으로 확인):**
     - `POST /api/game/proxy/Game/GetUserProfileBasicInfo`, `.../GetUserCharacters`. 몸통 `{"intl_open_id": "<29080- 뒤 숫자>", "nikke_area_id": 81}`. `x-common-params`는 `game_id "16"`, `intl_game_id "29080"`, `area_id "global"`.
     - `basic_info`: `nickname, lv(지휘관 레벨), team_combat(스쿼드 전투력), character_count, character_costume_count, progress_tribe_tower, created_at(유닉스 초), progress_*_campaign, currencies, profile_team` 등.
     - `characters[]`: `name_code, lv, grade, core, combat, costume_id`. `name_code`는 캐릭터 목록 JSON과 1:1이라 `src/data/name-codes.ts`로 도감 id에 잇는다.
     - 필드 의미 (2026-11-03, 사용자 본인 계정 156명으로 확인):
       - `grade`: 한계 돌파 횟수. SSR 0~3, SR은 2(최대), R은 0만 나왔다.
       - `core`: 코어 강화 단계. `grade`가 3인 SSR에서만 0이 아닌 값이 나왔다(이 계정은 최대 3). 게임 최대치 7은 응답으로 확인하지 못했고 게임 규칙을 따랐다.
       - `lv`: 니케 레벨. 싱크로 디바이스에 올린 니케는 모두 같은 값(이 계정 358), 나머지는 1이 많다.
       - `combat`: 니케 한 명의 전투력.
       - `costume_id`: 입고 있는 코스튬. 캐릭터 목록 JSON의 `costumes[].id`(예: 엠마 30016, 40001)와 같은 체계로 보고, 0이면 기본으로 다룬다. 실제 값이 이 체계인지는 응답 값으로 아직 대조하지 않았다.
     - 코스튬 이미지: 니케 상세 페이지(`/shiftyspad/nikke?nikke=<resource_id>`)의 코스튬 카드가 `alt="<resource_id>_<코스튬 id>_<순번>"`으로 해시 이미지 경로를 보여 준다. 코스튬이 있는 116명을 돌아 187벌을 `src/data/costumes.ts`에 모았다 (2026-11-03).
     - `basic_info.profile_team`: 배열이 아니라 **JSON 문자열**이다. 예: `'[{"name_code":1021,"slot":1},…,{"name_code":0,"slot":0}]'`. `slot` 1~5가 프로필 대표 스쿼드 칸이고 순서가 섞여 올 수 있다. `slot 0`/`name_code 0`은 빈 칸이다.
     - `basic_info`에는 그 밖에 `corporation_character_counts, progress_{elysion,missilis,tetra,pilgrim}_tower, sim_room_overclock_*, icon_id, role_name` 등이 있다. 슈엔노트는 쓰지 않는다(`currencies`도 넣지 않는다).
     - 비로그인이면 둘 다 `300001 game not login`. 로그인한 상태에서 `GetUserGamePlayerInfo`도 code 0이 된다.
     - 그 밖에 시프티패드가 부르는 것: `GetSavedRoleInfo`, `GetUserProfileOutpostInfo`, `GetUserDailyContentsProgress`, `GetMyGuildInfo {target_intl_open_id, target_nikke_area_id}`, `GetGuildDetail`, `GetGuildMembers`.
     - 몸통이 대상 ID를 받는 구조라 로그인한 계정으로 남의 정보를 보는 용도로 보이지만, **다른 사람 계정으로는 확인하지 않았다.**
   - 남은 리스크: 공개 정보라도 자동으로 가져오는 것은 EULA 7항(데이터 수집 도구)에 걸릴 여지가 있다. 계정 공유 문제는 없어졌다.

### (c) 공개 배포 체크리스트

- 모든 페이지 하단에 비공식 팬 사이트 표기와 권리자 표기 (적용함: `src/app/layout.tsx` 푸터)
- 광고, 후원, 유료 기능 없음 (사용자 확정 2026-11-03: 수익을 내지 않는 비영리 사이트). 제2조 1항 리스크는 이것으로 해소되지만, 제3조 3항(게임 제작·서비스)과 이미지 리스크는 비영리여도 남는다.
- 공식 로고 사용 안 함. 공식 이미지는 사용자 결정(2026-11-03)으로 blablalink CDN 핫링크를 쓴다 (`src/data/nikkes.ts`). 위 리스크를 감수한 선택이다.
- 도메인과 사이트 이름에 공식처럼 보이는 표현 쓰지 않기
- 공개 전 ugc@shiftup.co.kr 문의

## 4. 남은 확인 (사용자 로그인이 필요한 부분)

아래는 blablalink 로그인이 있어야 볼 수 있어 확인하지 않았다. 확인이 필요하면 사용자가 직접 로그인한 뒤 화면을 보여 주면 된다.

- ShiftyPad 프로필에 공식 "공유" 링크나 내보내기 기능이 있는지, 그 링크가 비로그인 상태에서도 열리는지
- `GetSavedRoleInfo`와 보유 니케 API 응답에 어떤 필드가 있는지 (UID, 서버, 레벨, 보유 니케)

## 출처

- blablalink 웹과 네트워크 요청 (2026-11-03 직접 확인): https://www.blablalink.com/shiftyspad/nikke-list
- 시프트업 2차 창작활동 가이드라인: https://policy.shiftup.co.kr/ip/kr/index.html
- 승리의 여신: 니케 최종 사용자 라이선스 계약: https://nikke-kr.com/termsofservice/
- 참고(제3자 디스코드 봇의 blablalink 연동 사례, 방식은 공개되지 않음): https://top.gg/bot/1522432799976587264
