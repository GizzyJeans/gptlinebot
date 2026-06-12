import { generateReply } from "../ai/openaiClient.js";
import { helpText, welcomeText } from "../commands/help.js";
import { parseCommand } from "../commands/parseCommand.js";
import { privacyText } from "../commands/privacy.js";
import {
  checkAndTouchRateLimit,
  clearGroupMessages,
  getOrCreateGroup,
  getRecentMessages,
  saveMessage,
  setGroupMode
} from "../db/repository.js";
import { replyText } from "./client.js";
import { LineEvent, LineSource, LineTextMessageEvent } from "./types.js";

function sourceConversationId(source: LineSource): string | undefined {
  if (source.type === "group") {
    return source.groupId;
  }

  if (source.type === "room") {
    return source.roomId;
  }

  return undefined;
}

function sourceUserId(source: LineSource): string | undefined {
  return "userId" in source ? source.userId : undefined;
}

function isTextMessageEvent(event: LineEvent): event is LineTextMessageEvent {
  return event.type === "message" && event.message?.type === "text";
}

export async function handleLineEvent(event: LineEvent) {
  if (event.type === "join") {
    await replyText(event.replyToken, welcomeText());
    return;
  }

  if (!isTextMessageEvent(event)) {
    return;
  }

  const conversationId = sourceConversationId(event.source);
  const command = parseCommand(event.message.text);

  if (command.kind === "ignore") {
    return;
  }

  if (!conversationId) {
    await replyText(event.replyToken, "我主要設計給 LINE 群組使用。把我加進群組後，用 /ai 叫我就可以。");
    return;
  }

  if (command.kind === "help") {
    await replyText(event.replyToken, helpText());
    return;
  }

  if (command.kind === "privacy") {
    await replyText(event.replyToken, privacyText());
    return;
  }

  if (command.kind === "reset") {
    clearGroupMessages(conversationId);
    await replyText(event.replyToken, "已清除這個群組和我的短期對話記憶。");
    return;
  }

  if (command.kind === "mode") {
    setGroupMode(conversationId, command.mode);
    await replyText(
      event.replyToken,
      command.mode === "detail" ? "已切換成詳細回答模式。" : "已切換成簡短回答模式。"
    );
    return;
  }

  const userId = sourceUserId(event.source);
  const rateLimit = checkAndTouchRateLimit(`${conversationId}:${userId ?? "unknown"}`);

  if (!rateLimit.allowed) {
    await replyText(
      event.replyToken,
      `等我 ${rateLimit.retryAfterSeconds} 秒一下，再問我下一題。`
    );
    return;
  }

  try {
    const group = getOrCreateGroup(conversationId);
    const history = group.memoryEnabled ? getRecentMessages(conversationId) : [];
    const aiReply = await generateReply(group, history, command.prompt);

    saveMessage(conversationId, "user", command.prompt, userId);
    saveMessage(conversationId, "assistant", aiReply);

    await replyText(event.replyToken, aiReply);
  } catch (error) {
    console.error("Failed to handle AI reply", error);
    await replyText(event.replyToken, "我剛剛處理失敗了，請稍後再試一次。");
  }
}
