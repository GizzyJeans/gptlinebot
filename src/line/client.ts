import { config } from "../config.js";

type LineTextMessage = {
  type: "text";
  text: string;
};

async function lineRequest(path: string, body: unknown) {
  const response = await fetch(`https://api.line.me/v2/bot${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.LINE_CHANNEL_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LINE API error ${response.status}: ${errorText}`);
  }
}

function splitLineText(text: string): LineTextMessage[] {
  const maxLength = 4500;
  const chunks: LineTextMessage[] = [];

  for (let index = 0; index < text.length; index += maxLength) {
    chunks.push({ type: "text", text: text.slice(index, index + maxLength) });
  }

  return chunks.slice(0, 5);
}

export async function replyText(replyToken: string, text: string) {
  await lineRequest("/message/reply", {
    replyToken,
    messages: splitLineText(text)
  });
}
