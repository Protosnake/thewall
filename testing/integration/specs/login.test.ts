import { test, suite } from "node:test";
import ApiClient from "../../api/ApiClient.js";
import Login from "../../api/routes/Login.js";
import assert from "assert";
import { PATHS } from "../../api/routes.js";

suite("Login", () => {
  test("Successful login should redirect to `/`", async () => {
    // Insert a user into DB first
    const apiClient = new ApiClient();
    const login = await new Login(apiClient).login({
      email: "test@test.com",
      password: "123123123",
    });
    login.expectStatus(200).hasPath(PATHS.FEED);
  });
  test("Should fail if user doesn't exist", async () => {
    const apiClient = new ApiClient();
    const login = await new Login(apiClient).login({
      email: "test@test.com",
      password: "123123123",
    });
    login.expectStatus(500).hasPath(PATHS.LOGIN);
  });
  test("Fail without email", async () => {
    const apiClient = new ApiClient();
    const login = await new Login(apiClient).login({
      password: "123123123",
    });
    login.expectStatus(500).hasPath(PATHS.LOGIN);
  });
  test("Fail without password", async () => {
    const apiClient = new ApiClient();
    const login = await new Login(apiClient).login({
      email: "test@test.com",
      password: "123123123",
    });
    login.expectStatus(500).hasPath(PATHS.LOGIN);
  });
});
