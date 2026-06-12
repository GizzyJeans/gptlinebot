import express, { Request } from "express";
import { config } from "./config.js";
import { migrate } from "./db/connection.js";
import { handleLineEvent } from "./line/handlers.js";
import { LineWebhookBody } from "./line/types.js";
import { verifyLineSignature } from "./line/verifySignature.js";

type RawBodyRequest = Request & {
  rawBody?: Buffer;
};

migrate();

const app = express();

app.use(
  express.json({
    verify: (request: RawBodyRequest, _response, buffer) => {
      request.rawBody = Buffer.from(buffer);
    }
  })
);

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/line/webhook", async (request: RawBodyRequest, response) => {
  const signature = request.header("x-line-signature");

  if (!request.rawBody || !verifyLineSignature(request.rawBody, signature)) {
    response.status(401).json({ error: "invalid LINE signature" });
    return;
  }

  const body = request.body as LineWebhookBody;

  response.status(200).json({ ok: true });

  await Promise.all(
    (body.events ?? []).map(async (event) => {
      try {
        await handleLineEvent(event);
      } catch (error) {
        console.error("Failed to handle LINE event", error);
      }
    })
  );
});

app.listen(config.PORT, () => {
  console.log(`LINE AI bot listening on port ${config.PORT}`);
});
