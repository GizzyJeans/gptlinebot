import { config } from "../config.js";

export type ParsedCommand =
  | { kind: "ignore" }
  | { kind: "help" }
  | { kind: "privacy" }
  | { kind: "reset" }
  | { kind: "mode"; mode: "short" | "detail" }
  | { kind: "ask"; prompt: string };

export function parseCommand(text: string): ParsedCommand {
  const trimmed = text.trim();
  const botMention = `@${config.BOT_DISPLAY_NAME}`;

  let body: string | undefined;

  if (/^\/ai(\s|$)/i.test(trimmed)) {
    body = trimmed.replace(/^\/ai/i, "").trim();
  } else if (trimmed.startsWith(botMention)) {
    body = trimmed.slice(botMention.length).trim();
  }

  if (body === undefined) {
    return { kind: "ignore" };
  }

  const normalized = body.toLowerCase();

  if (!body || normalized === "help") {
    return { kind: "help" };
  }

  if (normalized === "privacy") {
    return { kind: "privacy" };
  }

  if (normalized === "reset") {
    return { kind: "reset" };
  }

  if (normalized === "mode short") {
    return { kind: "mode", mode: "short" };
  }

  if (normalized === "mode detail") {
    return { kind: "mode", mode: "detail" };
  }

  return { kind: "ask", prompt: body };
}
