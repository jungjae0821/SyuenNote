import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// 보관하는 세션은 AES-256-GCM으로 암호화한다. 키는 SESSION_ENCRYPTION_KEY(32바이트 base64)에만 있고
// DB에는 암호문만 남는다. DB가 새어도 키 없이는 세션을 쓸 수 없다.
// 형식: v1.<iv>.<tag>.<암호문> (각 base64url). scripts/set-bot-session.mjs도 같은 형식으로 쓴다.
function key() {
  const raw = Buffer.from(process.env.SESSION_ENCRYPTION_KEY ?? "", "base64");
  if (raw.length !== 32) throw new Error("SESSION_ENCRYPTION_KEY는 32바이트 base64여야 합니다.");
  return raw;
}

export function encryptSession(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv, cipher.getAuthTag(), data].map((part) => (typeof part === "string" ? part : part.toString("base64url"))).join(".");
}

export function decryptSession(sealed: string) {
  const [version, iv, tag, data] = sealed.split(".");
  if (version !== "v1" || !iv || !tag || !data) throw new Error("알 수 없는 세션 형식입니다.");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}
