import { test, describe } from "testing/integration/fixtures/index.js";
import Login from "../../api/routes/Login.js";
import assert from "assert";

describe("Sign up", () => {
  test("Should be successfull", async ({ apiClient }) => {
    await apiClient
      .post("/signup", {
        email: "test@test.com",
        password: "123123123",
        repeatPassword: "123123123",
      })
      .then((res) => {
        assert(res.status === 302);
      });
  });
  test("Fail without email", async ({ apiClient }) => {
    const login = await new Login(apiClient).login({
      password: "123123123",
    });
    login.expectStatus(500);
  });
  test("Fail without password", async ({ apiClient }) => {
    const login = await new Login(apiClient).login({
      email: "test@test.com",
      password: "123123123",
    });
    login.expectStatus(500);
  });
});
