import { test } from "playwright/test";
import LoginPage from "../pages/Login.page.js";
import SignUpPage from "../pages/SingUp.page.js";
import pipeAsync from "../utils/pipeAsync.js";
import { hasText, isVisible } from "../components/index.component.js";

const randomEmail = () => crypto.getRandomValues(new Uint8Array(4)).join('') + "@test.com";

test.describe("Auth", () => {
  test("Cannot login with invalid credentials", async ({ page }) => {
    const loginPage= await LoginPage(page);
    const email = randomEmail();
    await loginPage.fillEmail(email);
    await loginPage.fillPassword("123123123");
    await loginPage.submit();
    await pipeAsync(
      loginPage.formError,
      isVisible,
      hasText('Invalid email or password')
    )
  });

  test('User have to repeat password for sign up', async ({ page }) => {
    const loginPage= await SignUpPage(page);
    await loginPage.fillEmail(randomEmail());
    await loginPage.fillPassword("123123123");
    await loginPage.submit();
    await pipeAsync(
      loginPage.formError,
      isVisible,
      hasText('Passwords do not match')
    )
  });

  test('Passwords should match', async ({ page }) => {
    const loginPage= await SignUpPage(page);
    await loginPage.fillEmail(randomEmail());
    await loginPage.fillPassword("password");
    await loginPage.fillRepeatPassword("non-password");
    await loginPage.submit();
    await pipeAsync(
      loginPage.formError,
      isVisible,
      hasText('Passwords do not match')
    )
  });
});
