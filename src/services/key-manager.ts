import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";

interface StoredKeys {
  [teamName: string]: { name: string; encryptedKey: string; iv: string; tag: string };
}

function getConfigDir(): string {
  const xdg = process.env.XDG_CONFIG_HOME;
  const base = xdg || path.join(os.homedir(), ".config");
  return path.join(base, "coolify-mcp");
}

function getKeysPath(): string {
  return path.join(getConfigDir(), "keys.json");
}

function ensureConfigDir(): void {
  const dir = getConfigDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getMasterKey(): Buffer {
  const envKey = process.env.COOLIFY_MASTER_KEY;
  if (envKey) {
    return crypto.createHash("sha256").update(envKey).digest();
  }
  // Fallback: derive from hostname + username
  const machineId = `${os.hostname()}-${os.userInfo().username}-coolify-mcp`;
  return crypto.createHash("sha256").update(machineId).digest();
}

function encrypt(text: string): { encryptedKey: string; iv: string; tag: string } {
  const key = getMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return { encryptedKey: encrypted, iv: iv.toString("hex"), tag: tag.toString("hex") };
}

function decrypt(data: { encryptedKey: string; iv: string; tag: string }): string {
  const key = getMasterKey();
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(data.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(data.tag, "hex"));
  let decrypted = decipher.update(data.encryptedKey, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function readStore(): StoredKeys {
  const p = getKeysPath();
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as StoredKeys;
  } catch {
    return {};
  }
}

function writeStore(store: StoredKeys): void {
  ensureConfigDir();
  fs.writeFileSync(getKeysPath(), JSON.stringify(store, null, 2), { mode: 0o600 });
}

export function addKey(teamName: string, apiKey: string): void {
  const store = readStore();
  const name = teamName.toLowerCase();
  store[name] = { name, ...encrypt(apiKey) };
  writeStore(store);
}

export function removeKey(teamName: string): boolean {
  const store = readStore();
  const name = teamName.toLowerCase();
  if (!(name in store)) return false;
  delete store[name];
  writeStore(store);
  return true;
}

export function listKeys(): Array<{ name: string; maskedKey: string }> {
  const store = readStore();
  return Object.values(store).map((entry) => {
    try {
      const key = decrypt(entry);
      const masked = key.length > 8 ? key.slice(0, 4) + "****" + key.slice(-4) : "****";
      return { name: entry.name, maskedKey: masked };
    } catch {
      return { name: entry.name, maskedKey: "[decryption failed]" };
    }
  });
}

export function rotateKey(teamName: string, newApiKey: string): boolean {
  const store = readStore();
  const name = teamName.toLowerCase();
  if (!(name in store)) return false;
  store[name] = { name, ...encrypt(newApiKey) };
  writeStore(store);
  return true;
}

/**
 * Load stored keys as a map of teamName -> apiKey (decrypted).
 * Used by config.ts to merge with env vars.
 */
export function loadStoredKeys(): Map<string, { name: string; apiKey: string }> {
  const store = readStore();
  const result = new Map<string, { name: string; apiKey: string }>();
  for (const [teamName, entry] of Object.entries(store)) {
    try {
      const apiKey = decrypt(entry);
      result.set(teamName, { name: teamName, apiKey });
    } catch {
      // Skip keys that can't be decrypted
    }
  }
  return result;
}
