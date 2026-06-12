import { config } from "../config.js";

export function helpText() {
  return [
    `我是 ${config.BOT_DISPLAY_NAME}，在群組裡用 /ai 或 @${config.BOT_DISPLAY_NAME} 叫我就好。`,
    "",
    "可用指令：",
    "/ai 你的問題",
    "/ai reset - 清除這個群組和我的短期對話記憶",
    "/ai privacy - 查看資料處理方式",
    "/ai mode short - 簡短回答",
    "/ai mode detail - 詳細回答"
  ].join("\n");
}

export function welcomeText() {
  return [
    `大家好，我是 ${config.BOT_DISPLAY_NAME}。`,
    "",
    "用 /ai 加問題就可以叫我，例如：",
    "/ai 幫我整理剛剛的討論重點",
    "",
    "我只處理被 /ai 或 @我 呼叫的訊息；一般聊天不會送到 AI，也不會保存。",
    "輸入 /ai privacy 可以查看資料處理說明。"
  ].join("\n");
}
