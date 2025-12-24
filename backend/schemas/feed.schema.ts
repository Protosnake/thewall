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
        content: z
          .string()
          .min(1, "You cannot create an empty post")
          .max(300, "You cannot create a post longer than 300 characters"),
      }),
    },
  },
} as const;
