import z from "zod";

export const MAX_CHAR_FOR_POST = 300;
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
          .max(
            MAX_CHAR_FOR_POST,
            "You cannot create a post longer than 300 characters"
          ),
      }),
    },
  },
  like: {
    path: "/post/:id/like",
    POST: {
      params: z.object({
        id: z.string(),
      }),
    },
  },
} as const;

export type PostBodyT = z.infer<typeof FeedSchema.post.POST.body>;
export type LikeParamsT = z.infer<typeof FeedSchema.like.POST.params>;
