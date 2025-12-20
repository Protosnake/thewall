import type ApiClient from "./ApiClient.js";

export const PATHS = {
  LOGIN: "login",
  SIGNUP: "signup",
  FEED: "/",
};

export default (api: ApiClient) => ({
  login: (body: { email?: string; password?: string }) => {
    return api.post(PATHS.LOGIN, body);
  },
  signUp: (body: {
    email?: string;
    password?: string;
    repeatPassword?: string;
  }) => {
    return api.post(PATHS.SIGNUP, body);
  },
});
