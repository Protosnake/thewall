import { test, describe } from "testing/integration/fixtures/index.js";
import routes from "testing/api/routes.js";
import { expect } from "bun:test";
import HTTP_CODES from "constants/HTTP_CODES.js";

describe("Sign up", () => {
  test("Should be successfull", async ({ apiClient }) => {
    await routes(apiClient)
      .signUp({
        email: "test@test.com",
        password: "123123123",
        repeatPassword: "123123123",
      })
      .then((res) => {
        expect(res.status).toBe(HTTP_CODES.REDIRECT);
      });
  });
  test("Fail without email", async ({ apiClient }) => {
    await routes(apiClient)
      .signUp({
        password: "123123123",
      })
      .then((res) => {
        expect(res.status).toBe(HTTP_CODES.BAD_REQUEST);
      });
  });
  test("Fail without second password", async ({ apiClient }) => {
    await routes(apiClient)
      .signUp({
        email: "test@test.com",
        password: "123123123",
      })
      .then((res) => {
        expect(res.status).toBe(HTTP_CODES.BAD_REQUEST);
      });
  });
});
