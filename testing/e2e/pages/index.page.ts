import type { Page } from "playwright";
import assert from "assert";

export const open =
  (path: string) =>
  async (page: Page): Promise<Page> => {
    await page.goto(path);
    return page;
  };

export const isOpen =
  (path: string) =>
  async (page: Page): Promise<Page> => {
    const { pathname } = new URL(page.url());
    assert(
      pathname === path,
      `Unexpected url: ${pathname} does not match ${path}`,
    );
    return page;
  };

