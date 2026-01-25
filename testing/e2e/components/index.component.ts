import type { Locator, Page } from "playwright";
import { expect } from "playwright/test";

export async function isVisible(locator: Locator): Promise<Locator> {
  await expect(locator).toBeVisible();
  return locator;
}

export function fill(value: string) {
  return async (locator: Locator): Promise<Locator> => {
    await locator.fill(value);
    return locator;
  };
}

export function hasValue(value: string) {
  return async (locator: Locator): Promise<Locator> => {
    await expect(locator).toHaveValue(value);
    return locator;
  };
}

export function hasText(text: string) {
  return async (locator: Locator): Promise<Locator> => {
    await expect(locator).toHaveText(text);
    return locator;
  };
}

export function click() {
  return async (locator: Locator): Promise<Locator> => {
    await locator.click();
    return locator;
  };
}

export default (selector: string) => (scope: Page | Locator) => scope.locator(selector);