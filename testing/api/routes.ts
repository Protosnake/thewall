import type { LoginBody, SignupBody } from "backend/schemas/auth.schema.js";
import { AuthSchema } from "backend/schemas/auth.schema.js";
import type ApiClient from "./ApiClient.js";

export default (api: ApiClient) => ({
  login: (body: Partial<LoginBody>) => {
    return api.post(AuthSchema.login.path, body);
  },
  signUp: (body: Partial<SignupBody>) => {
    return api.post(AuthSchema.signup.path, body);
  },
});
