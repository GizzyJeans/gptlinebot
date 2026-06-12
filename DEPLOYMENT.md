# Deployment Guide

這份文件用 Render + Docker 當範例。你也可以部署到 Fly.io、Railway、Google Cloud Run，核心條件是一樣的：公開 HTTPS URL、環境變數、可寫入資料庫位置。

## 1. 準備 OpenAI API key

建立一組 OpenAI API key，部署時填入：

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.5
```

正式環境建議固定模型名稱，不要在程式裡寫死，之後要換模型只改環境變數。

## 2. 準備 LINE channel

在 LINE Developers：

1. 建立 Provider。
2. 建立 Messaging API channel。
3. 到 Messaging API 頁籤取得 `Channel secret`。
4. 發行 `Channel access token`。
5. 開啟 `Use webhook`。
6. 開啟 `Allow bot to join group chats`。

部署時填入：

```env
LINE_CHANNEL_SECRET=...
LINE_CHANNEL_ACCESS_TOKEN=...
```

## 3. 部署到 Render

1. 把這個專案放到 GitHub repo。
2. 在 Render 建立 Blueprint 或 Web Service。
3. 如果使用 Blueprint，選擇 repo 中的 `render.yaml`。
4. 在 Render dashboard 填入三個 secret：

```env
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
OPENAI_API_KEY
```

5. 部署完成後，確認健康檢查 URL：

```text
https://你的-render-domain/health
```

應該回傳：

```json
{"ok":true}
```

## 4. 設定 LINE webhook URL

把 Render 網址填回 LINE Developers：

```text
https://你的-render-domain/line/webhook
```

按下 Verify。如果成功，LINE 會顯示 webhook 可用。

## 5. 加入 LINE 群組

把 LINE Official Account 加進群組後，bot 會送出歡迎訊息。

測試：

```text
/ai help
/ai 你可以做什麼？
/ai privacy
/ai mode detail
/ai reset
```

## 6. 上線前檢查表

- LINE webhook 已開啟。
- `Allow bot to join group chats` 已開啟。
- Render 環境變數三個 secret 都已填入。
- `/health` 回傳 `{"ok":true}`。
- 群組中 `/ai help` 有回覆。
- 群組成員知道 `/ai privacy` 的資料處理說明。
- 沒有把 `.env` commit 到 GitHub。

## 7. 常見問題

### LINE Verify 失敗

檢查：

- Webhook URL 是否是 HTTPS。
- URL 是否包含 `/line/webhook`。
- `LINE_CHANNEL_SECRET` 是否正確。
- Render service 是否已啟動。

### 群組中沒有回覆

檢查：

- 是否用 `/ai` 或 `@小幫手` 呼叫。
- LINE channel access token 是否有效。
- Render logs 是否有 OpenAI 或 LINE API error。

### 重新部署後記憶消失

如果沒有設定持久化磁碟，SQLite 檔案會被清掉。Render 範例已經在 `render.yaml` 設定 `/app/data` disk。

### 想改成 PostgreSQL

正式環境多群組、高流量時建議改 PostgreSQL。第一版為了簡單，用 SQLite；資料存取集中在 `src/db/repository.ts`，之後替換相對容易。
