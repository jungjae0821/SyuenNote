// 운영용 blablalink 계정의 쿠키를 암호화해 Supabase bot_sessions에 넣는다.
//
//   암호화 키 만들기:  node scripts/set-bot-session.mjs --new-key
//   세션 넣기:        node --env-file=.env.local scripts/set-bot-session.mjs
//
// 쿠키는 명령줄 인자로 받지 않는다(셸 기록에 남는다). 실행한 뒤 붙여넣고 Enter를 누른다.
// 암호화 형식은 src/lib/session-crypto.ts와 같다.
import { createCipheriv, randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { createClient } from "@supabase/supabase-js";

if (process.argv.includes("--new-key")) {
  console.log(randomBytes(32).toString("base64"));
  process.exit(0);
}

const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SECRET_KEY: secretKey, SESSION_ENCRYPTION_KEY: rawKey } = process.env;
const key = Buffer.from(rawKey ?? "", "base64");
if (!url || !secretKey) throw new Error(".env.local에 NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SECRET_KEY가 필요합니다.");
if (key.length !== 32) throw new Error("SESSION_ENCRYPTION_KEY는 32바이트 base64여야 합니다. --new-key로 만드세요.");

const rl = createInterface({ input: process.stdin, output: process.stdout });
const cookie = (await rl.question("운영 계정의 api.blablalink.com 요청 Cookie 값을 붙여넣으세요: ")).trim().replace(/^cookie:\s*/i, "");
rl.close();
if (!/^[\x20-\x7e]+$/.test(cookie)) throw new Error("Cookie 값이 비었거나 줄바꿈 같은 글자가 섞여 있습니다.");

const iv = randomBytes(12);
const cipher = createCipheriv("aes-256-gcm", key, iv);
const data = Buffer.concat([cipher.update(cookie, "utf8"), cipher.final()]);
const ciphertext = ["v1", iv, cipher.getAuthTag(), data]
  .map((part) => (typeof part === "string" ? part : part.toString("base64url")))
  .join(".");

const supabase = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { error } = await supabase
  .from("bot_sessions")
  .upsert({ id: "blablalink", ciphertext, updated_at: new Date().toISOString() });
if (error) throw new Error(`저장하지 못했습니다: ${error.message}`);

console.log("암호화한 세션을 저장했습니다.");
