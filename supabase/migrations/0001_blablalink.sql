-- blablalink 프로필 연결과 운영 계정 세션.
-- Supabase 대시보드 > SQL Editor에 붙여넣고 실행한다.

-- 디스코드 사용자 한 명에 blablalink 프로필 하나.
-- code가 있으면 인증 대기 중, verified_at이 있으면 연결됨.
create table public.blablalink_links (
  user_id uuid primary key references auth.users (id) on delete cascade,
  openid text not null,
  code text,
  code_expires_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- 인증을 마친 프로필은 한 사용자에게만 연결된다.
create unique index blablalink_links_verified_openid on public.blablalink_links (openid) where verified_at is not null;

-- 운영 계정의 blablalink 세션. AES-256-GCM으로 암호화한 값만 둔다.
create table public.bot_sessions (
  id text primary key,
  ciphertext text not null,
  updated_at timestamptz not null default now()
);

-- 두 테이블 모두 브라우저(publishable key)에서는 읽지도 쓰지도 못한다.
-- 인증 확인을 사용자가 건너뛰지 못하도록 쓰기는 서버의 secret key로만 한다.
alter table public.blablalink_links enable row level security;
alter table public.bot_sessions enable row level security;
