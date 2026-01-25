import type { Page } from "playwright";
import component, { fill, click, hasValue } from "../components/index.component.js";
import { isOpen, open } from "./index.page.js";
import pipeAsync from "../utils/pipeAsync.js";
import FormErrorComponent from "../components/FormError.component.js";

const emailInput = component('input[name="email"]');
const passwordInput = component('input[name="password"]');
const repeatPasswordInput = component('input[name="repeatPassword"]');
const submitButton = component('button[type="submit"]');

export const PATH = "/signup";

export default async (page: Page) => {
  await pipeAsync(page, open(PATH), isOpen(PATH));

  const fillEmail = (email: string) => pipeAsync(emailInput(page), fill(email), hasValue(email));
  const fillPassword = (password: string) => pipeAsync(passwordInput(page), fill(password), hasValue(password));
  const fillRepeatPassword = (password: string) => pipeAsync(repeatPasswordInput(page), fill(password), hasValue(password));
  const submit = () => pipeAsync(submitButton(page), click());

  return {
    fillEmail,
    fillPassword,
    fillRepeatPassword,
    submit,
    formError: FormErrorComponent(page),
    signup: async (credentials: { email: string; password: string }) => {
      const { email, password } = credentials;
      await fillEmail(email)
      await fillPassword(password)
      await fillRepeatPassword(password)
      await submit()
      await page.waitForEvent('load')
      await pipeAsync(page, isOpen('/'))
    }
  };
};
