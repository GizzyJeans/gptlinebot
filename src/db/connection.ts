import Database from "better-sqlite3";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";

const schemaPath = fileURLToPath(new URL("./schema.sql", import.meta.url));

function resolveDatabasePath(databaseUrl: string): string {
  if (databaseUrl.startsWith("sqlite://")) {
    return databaseUrl.replace(/^sqlite:\/\//, "");
  }

  return databaseUrl;
}

const databasePath = resolve(resolveDatabasePath(config.DATABASE_URL));
mkdirSync(dirname(databasePath), { recursive: true });

export const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function migrate() {
  const schema = readFileSync(schemaPath, "utf8");
  db.exec(schema);
}
