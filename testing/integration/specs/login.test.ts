import { test, describe } from "testing/integration/fixtures/index.js";
import Login from "testing/api/routes/Login.js";
import { PATHS } from "testing/api/routes.js";

describe("Login", () => {
  test.skip("Successful login should redirect to `/`", async ({
    apiClient,
  }) => {
    // Insert a user into DB first
    const login = await new Login(apiClient).login({
      email: "test@test.com",
      password: "123123123",
    });
    login.expectStatus(200).hasPath(PATHS.FEED);
  });
  test("To be removed", async ({ apiClient }) => {
    const res = await apiClient.get("/");
    console.log(res);
  });
  test("Should fail if user doesn't exist", async ({ apiClient }) => {
    const login = await new Login(apiClient).login({
      email: "test@test.com",
      password: "123123123",
    });
    login.expectStatus(500);
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
