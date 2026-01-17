import { test, describe } from "testing/integration/fixtures/index.js";
import routes from "testing/api/routes.js";
import User from "backend/entities/User.js";
import { expect } from "bun:test";
import HTTP_CODES from "constants/HTTP_CODES.js";
import { isHtmxError } from "../asserts.js";

describe("Login", () => {
  test("Successful login should redirect to `/`", async ({ apiClient, db }) => {
    const credentials = {
      email: "test@test.com",
      password: "123123123",
    };
    await new User(db).create(credentials);

    await routes(apiClient)
      .login(credentials)
      .then((res) => {
        expect(res.status).toBe(HTTP_CODES.REDIRECT);
      });
  });
  test("Should fail if user doesn't exist", async ({ apiClient }) => {
    await routes(apiClient)
      .login({
        email: "test@test.com",
        password: "123123123",
      })
      .then((res) => {
        isHtmxError(res);
      });
  });
  test("Fail without email", async ({ apiClient }) => {
    await routes(apiClient)
      .login({
        password: "123123123",
      })
      .then((res) => {
        isHtmxError(res);
      });
  });
  test("Fail without password", async ({ apiClient }) => {
    await routes(apiClient)
      .login({
        password: "123123123",
      })
      .then((res) => {
        isHtmxError(res);
      });
  });
});
