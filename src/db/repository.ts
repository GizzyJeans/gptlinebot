import crypto from "node:crypto";
import { config } from "../config.js";
import { db } from "./connection.js";

export type GroupSettings = {
  id: string;
  mode: "short" | "detail";
  memoryEnabled: boolean;
};

export type StoredMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type GroupRow = {
  id: string;
  mode: "short" | "detail";
  memory_enabled: number;
};

type MessageRow = {
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export function getOrCreateGroup(groupId: string): GroupSettings {
  db.prepare("INSERT OR IGNORE INTO groups (id) VALUES (?)").run(groupId);

  const row = db
    .prepare("SELECT id, mode, memory_enabled FROM groups WHERE id = ?")
    .get(groupId) as GroupRow;

  return {
    id: row.id,
    mode: row.mode,
    memoryEnabled: Boolean(row.memory_enabled)
  };
}

export function setGroupMode(groupId: string, mode: "short" | "detail") {
  getOrCreateGroup(groupId);
  db.prepare(
    "UPDATE groups SET mode = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(mode, groupId);
}

export function saveMessage(
  groupId: string,
  role: "user" | "assistant",
  content: string,
  userId?: string
) {
  getOrCreateGroup(groupId);
  db.prepare(
    `INSERT INTO messages (id, group_id, user_id, role, content)
     VALUES (?, ?, ?, ?, ?)`
  ).run(crypto.randomUUID(), groupId, userId ?? null, role, content);
}

export function getRecentMessages(groupId: string): StoredMessage[] {
  const rows = db
    .prepare(
      `SELECT role, content, created_at
       FROM messages
       WHERE group_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .all(groupId, config.MAX_CONTEXT_MESSAGES) as MessageRow[];

  return rows.reverse().map((row) => ({
    role: row.role,
    content: row.content,
    createdAt: row.created_at
  }));
}

export function clearGroupMessages(groupId: string) {
  db.prepare("DELETE FROM messages WHERE group_id = ?").run(groupId);
}

export function checkAndTouchRateLimit(key: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  if (config.RATE_LIMIT_SECONDS === 0) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const row = db
    .prepare("SELECT last_called_at FROM rate_limits WHERE key = ?")
    .get(key) as { last_called_at: string } | undefined;

  const now = Date.now();

  if (row) {
    const elapsedSeconds = Math.floor(
      (now - new Date(row.last_called_at).getTime()) / 1000
    );

    if (elapsedSeconds < config.RATE_LIMIT_SECONDS) {
      return {
        allowed: false,
        retryAfterSeconds: config.RATE_LIMIT_SECONDS - elapsedSeconds
      };
    }
  }

  db.prepare(
    `INSERT INTO rate_limits (key, last_called_at)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET last_called_at = excluded.last_called_at`
  ).run(key, new Date(now).toISOString());

  return { allowed: true, retryAfterSeconds: 0 };
}
