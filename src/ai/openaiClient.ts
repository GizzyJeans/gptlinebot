import OpenAI from "openai";
import { config } from "../config.js";
import { GroupSettings, StoredMessage } from "../db/repository.js";
import { buildInput, buildInstructions } from "./buildPrompt.js";

const client = new OpenAI({
  apiKey: config.OPENAI_API_KEY
});

export async function generateReply(
  group: GroupSettings,
  history: StoredMessage[],
  prompt: string
) {
  const response = await client.responses.create({
    model: config.OPENAI_MODEL,
    instructions: buildInstructions(group),
    input: buildInput(history, prompt)
  });

  const text = response.output_text?.trim();

  if (!text) {
    return "我剛剛沒有產生可用的文字回覆，請再問我一次。";
  }

  return text;
}
