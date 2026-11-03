# 디스코드 로그인 설정

코드(`src/app/auth/actions.ts`, `src/app/auth/callback/route.ts`, `src/proxy.ts`)는 준비되어 있다. 실제로 로그인하려면 아래 대시보드 설정과 `.env.local`이 필요하다. 키와 비밀값은 커밋하지 않는다(`.gitignore`가 `.env*`를 막는다).

흐름: 디스코드로 로그인 버튼 → Supabase → 디스코드 동의 화면 → Supabase → `/auth/callback` → `/me`

## 1. Supabase 프로젝트

1. https://supabase.com/dashboard 에서 새 프로젝트를 만든다.
2. Project Settings > API Keys에서 아래 두 값을 복사한다.
   - Project URL (`https://<project-ref>.supabase.co`)
   - publishable key (`sb_publishable_...`). 없으면 기존 anon key.

## 2. 디스코드 애플리케이션

1. https://discord.com/developers/applications 에서 New Application을 만든다. 이름은 "슈엔노트"처럼 공식으로 보이지 않는 이름으로 한다.
2. OAuth2 메뉴에서 Client ID를 복사하고, Reset Secret으로 Client Secret을 만든다.
3. OAuth2 > Redirects에 아래 주소를 추가하고 저장한다.
   ```
   https://<project-ref>.supabase.co/auth/v1/callback
   ```

## 3. Supabase에 디스코드 연결

1. Authentication > Sign In / Providers > Discord를 켠다.
2. 2단계의 Client ID와 Client Secret을 넣고 저장한다.
3. Authentication > URL Configuration
   - Site URL: `http://localhost:3000` (배포 후 실제 도메인으로 바꾼다)
   - Redirect URLs에 추가: `http://localhost:3000/auth/callback`, 배포 후 `https://<도메인>/auth/callback`

## 4. `.env.local`

프로젝트 루트에 `.env.example`을 복사해 `.env.local`을 만들고 1단계 값을 넣는다.

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

환경 변수는 서버를 켤 때 읽으므로 `npm run dev`를 껐다가 다시 켠다.

## 5. 확인

1. `/me`에 들어가면 "로그인이 필요합니다"가 보인다.
2. 디스코드로 로그인 → 디스코드 동의 → `/me`로 돌아와 상단바에 디스코드 이름이 보이고 내 정보가 열린다.
3. 실패하면 `/me?error=login-failed`로 온다. 대부분 Redirect URL 불일치(2-3, 3-3단계)다.

## 배포(Vercel)

Vercel 프로젝트 Environment Variables에 같은 세 값을 넣는다. `NEXT_PUBLIC_SITE_URL`은 실제 도메인으로 한다. Supabase Redirect URLs에도 그 도메인의 `/auth/callback`을 추가한다.

## blablalink 연결 (게임 정보)

1. Supabase SQL Editor에서 `supabase/migrations/0001_blablalink.sql`, `0002_blablalink_area.sql`을 차례로 실행한다.
2. Project Settings > API Keys에서 secret key(`sb_secret_...`)를 복사해 `.env.local`의 `SUPABASE_SECRET_KEY`에 넣는다. 이 키는 RLS를 건너뛰므로 절대 공개하지 않는다.
3. 암호화 키를 만든다. 출력된 값을 `SESSION_ENCRYPTION_KEY`에 넣는다.
   ```
   node scripts/set-bot-session.mjs --new-key
   ```
4. 슈엔노트 운영용 blablalink 계정(개인 계정과 분리 권장)으로 로그인하고, 개발자 도구 네트워크 탭에서 `api.blablalink.com` 요청의 Cookie 값을 복사한다.
5. 아래를 실행하고 Cookie 값을 붙여넣는다. 암호화된 값만 DB에 저장된다.
   ```
   node --env-file=.env.local scripts/set-bot-session.mjs
   ```
6. 개발 서버를 다시 켠다. 세션이 만료되면 4~5단계를 다시 한다.

Vercel에는 `SUPABASE_SECRET_KEY`, `SESSION_ENCRYPTION_KEY`도 넣는다. 암호화 키를 바꾸면 5단계를 다시 해야 한다.
