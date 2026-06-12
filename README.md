# LINE AI Bot

一個給 LINE 群組使用的 AI 小幫手 MVP。它只在被 `/ai` 或 `@小幫手` 明確呼叫時回覆，一般群聊訊息會被忽略，不送到 OpenAI，也不保存。

## 功能

- LINE Messaging API webhook
- LINE `X-Line-Signature` 驗證
- `/ai` 與 `@小幫手` 觸發
- `/ai help`
- `/ai privacy`
- `/ai reset`
- `/ai mode short`
- `/ai mode detail`
- 每個群組獨立短期記憶
- SQLite 儲存 bot 互動紀錄與 rate limit
- OpenAI Responses API 回覆

## LINE 設定

1. 建立 LINE Official Account。
2. 在 LINE Developers 建立 Messaging API channel。
3. 在 Messaging API 頁籤開啟 `Allow bot to join group chats`。
4. 開啟 webhook。
5. 把部署後的 URL 填入 Webhook URL：

```text
https://你的網域/line/webhook
```

## 本機設定

```bash
npm install
cp .env.example .env
npm run preflight
npm run db:init
npm run dev
```

填入 `.env`：

```env
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5
BOT_DISPLAY_NAME=小幫手
DATABASE_URL=./data/line-ai-bot.sqlite
```

本機測試 LINE webhook 時，需要把本機服務公開到網路，例如使用 ngrok 或 Cloudflare Tunnel。

## 群組使用方式

```text
/ai 幫我整理這段討論
@小幫手 這個錯誤訊息是什麼意思？
/ai privacy
/ai reset
/ai mode detail
```

## 隱私策略

- 沒有 `/ai` 或 `@小幫手` 的群聊訊息會直接忽略。
- 只有使用者明確呼叫 bot 的問題和 bot 回覆會被保存成短期上下文。
- `/ai reset` 會刪除該群組的短期對話記憶。
- 不建議在群組中傳送密碼、身分證字號、信用卡等敏感資料。

## 部署建議

Render、Fly.io、Railway、Google Cloud Run 都可以。服務需要：

- 可公開存取的 HTTPS URL
- 環境變數
- 可寫入的 SQLite volume，或改接 PostgreSQL

如果部署平台沒有持久化磁碟，SQLite 檔案會在重啟後遺失。正式環境建議改成 PostgreSQL。

這個專案已附：

```text
Dockerfile
render.yaml
DEPLOYMENT.md
.github/workflows/ci.yml
```

Render 部署可以參考 `DEPLOYMENT.md`。

推上 GitHub 後，GitHub Actions 會自動執行 `npm install`、`npm run typecheck` 和 `npm run build`。

## 重要檔案

```text
src/index.ts                  Express server
src/line/verifySignature.ts   LINE webhook 簽章驗證
src/line/handlers.ts          LINE event 主流程
src/commands/parseCommand.ts  指令解析
src/ai/openaiClient.ts        OpenAI Responses API 呼叫
src/db/repository.ts          SQLite 存取
```
