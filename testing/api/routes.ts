import type { LoginBody, SignupBody } from "backend/schemas/auth.schema.js";
import { AuthSchema } from "backend/schemas/auth.schema.js";
import type ApiClient from "./ApiClient.js";
import {
  FeedSchema,
  type LikeParamsT,
  type PostBodyT,
} from "backend/schemas/feed.schema.js";

export default (api: ApiClient) => ({
  login: (body: Partial<LoginBody>) => {
    return api.post(AuthSchema.login.path, body);
  },
  signUp: (body: Partial<SignupBody>) => {
    return api.post(AuthSchema.signup.path, body);
  },
  feed: () => {
    return api.get(FeedSchema.feed.path);
  },
  getPost: () => {
    return api.get(FeedSchema.post.path);
  },
  createPost: (body: PostBodyT) => {
    return api.post(FeedSchema.post.path, body);
  },
  likePost: (params: LikeParamsT) => {
    return api.post(FeedSchema.like.path, {}, true, params);
  },
});
