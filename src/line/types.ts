export type LineSource =
  | { type: "user"; userId: string }
  | { type: "group"; groupId: string; userId?: string }
  | { type: "room"; roomId: string; userId?: string };

export type LineTextMessageEvent = {
  type: "message";
  replyToken: string;
  source: LineSource;
  message: {
    id: string;
    type: "text";
    text: string;
    mention?: {
      mentionees?: Array<{
        index: number;
        length: number;
        type: "user" | "all";
        userId?: string;
      }>;
    };
  };
};

export type LineJoinEvent = {
  type: "join";
  replyToken: string;
  source: LineSource;
};

export type LineLeaveEvent = {
  type: "leave";
  source: LineSource;
};

export type LineEvent = LineTextMessageEvent | LineJoinEvent | LineLeaveEvent;

export type LineWebhookBody = {
  destination: string;
  events: LineEvent[];
};
