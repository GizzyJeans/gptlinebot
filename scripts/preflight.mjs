import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";

const required = [
  "LINE_CHANNEL_SECRET",
  "LINE_CHANNEL_ACCESS_TOKEN",
  "OPENAI_API_KEY"
];

const optionalDefaults = {
  PORT: "3000",
  OPENAI_MODEL: "gpt-5.5",
  BOT_DISPLAY_NAME: "小幫手",
  DATABASE_URL: "./data/line-ai-bot.sqlite",
  MAX_CONTEXT_MESSAGES: "12",
  RATE_LIMIT_SECONDS: "10"
};

async function loadDotEnv() {
  if (!existsSync(".env")) {
    return {};
  }

  const text = await import("node:fs").then((fs) =>
    fs.readFileSync(".env", "utf8")
  );

  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

const dotEnv = await loadDotEnv();
const env = { ...optionalDefaults, ...dotEnv, ...process.env };
const missing = required.filter((key) => !env[key]);

if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exitCode = 1;
}

const databasePath = resolve(env.DATABASE_URL.replace(/^sqlite:\/\//, ""));
const databaseDir = dirname(databasePath);

try {
  mkdirSync(databaseDir, { recursive: true });
  const testPath = resolve(databaseDir, ".write-test");
  writeFileSync(testPath, "ok");
  unlinkSync(testPath);
  console.log(`Database directory is writable: ${databaseDir}`);
} catch (error) {
  console.error(`Database directory is not writable: ${databaseDir}`);
  console.error(error);
  process.exitCode = 1;
}

console.log(`PORT=${env.PORT}`);
console.log(`OPENAI_MODEL=${env.OPENAI_MODEL}`);
console.log(`BOT_DISPLAY_NAME=${env.BOT_DISPLAY_NAME}`);

if (!process.exitCode) {
  console.log("Preflight checks passed.");
}
