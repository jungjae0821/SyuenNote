-- 연결할 때 고른 게임 서버(area_id: 83 한국, 81 일본, 84 글로벌, 82 북미, 85 동남아).
-- 0001을 이미 실행했다면 이것도 SQL Editor에서 실행한다.
alter table public.blablalink_links add column if not exists area_id text not null default '83';
