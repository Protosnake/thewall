import z from "zod";

export const FeedSchema = {
  feed: {
    path: "/",
    GET: {},
  },
  post: {
    path: "/post",
    POST: {
      body: z.object({
        content: z.string().min(1, "You cannot create an empty post"),
      }),
    },
  },
} as const;
