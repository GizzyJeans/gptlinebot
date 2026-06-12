import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  LINE_CHANNEL_SECRET: z.string().min(1),
  LINE_CHANNEL_ACCESS_TOKEN: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default("gpt-5.5"),
  BOT_DISPLAY_NAME: z.string().min(1).default("小幫手"),
  DATABASE_URL: z.string().min(1).default("./data/line-ai-bot.sqlite"),
  MAX_CONTEXT_MESSAGES: z.coerce.number().int().positive().default(12),
  RATE_LIMIT_SECONDS: z.coerce.number().int().nonnegative().default(10)
});

export const config = envSchema.parse(process.env);
