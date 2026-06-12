import { GroupSettings, StoredMessage } from "../db/repository.js";

export function buildInstructions(group: GroupSettings): string {
  const answerStyle =
    group.mode === "detail"
      ? "可以分段或列點，適合摘要、規劃、技術解釋。"
      : "盡量用 1 到 5 句回答，適合群聊，不長篇。";

  return [
    "你是 LINE 群組中的 AI 小幫手。",
    "你只回應本次被明確呼叫的問題。",
    "請使用繁體中文，語氣自然、簡潔、友善。",
    "不要假裝自己看過未提供的群組訊息。",
    "如果問題需要上下文，請直接請使用者貼上相關內容。",
    "涉及醫療、法律、投資等高風險主題時，提供一般資訊並提醒使用者尋求專業意見。",
    `目前回答模式：${group.mode}。${answerStyle}`
  ].join("\n");
}

export function buildInput(history: StoredMessage[], prompt: string) {
  const input = history.map((message) => ({
    role: message.role,
    content: message.content
  }));

  input.push({
    role: "user",
    content: prompt
  });

  return input;
}
