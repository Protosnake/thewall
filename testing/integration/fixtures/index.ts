import DatabaseClient from "backend/database/DatabaseClient.js";
import { test as _test, describe as _describe } from "bun:test";
import ApiClient from "testing/api/ApiClient.js";

export const describe = _describe;

type TestFixture = {
  db: DatabaseClient;
  apiClient: ApiClient;
};

/**
 * This helper ensures that the setup logic is wrapped consistently
 * for both active and skipped tests.
 * * It initializes a fresh in-memory SQLite DB, runs migrations,
 * and provides a clean ApiClient.
 */
const wrap = (fn: (fixture: TestFixture) => void | Promise<unknown>) => {
  return async () => {
    const db = new DatabaseClient(":memory:");

    try {
      const apiClient = new ApiClient(db);

      await fn({ db, apiClient });
    } catch (error) {
      console.error("Test Setup Failed:", error);
      throw error;
    } finally {
      db.close();
    }
  };
};

/**
 * Custom Test Wrapper with Modifier Support
 */
export const test = Object.assign(
  (title: string, fn: (fixture: TestFixture) => void | Promise<unknown>) =>
    _test(title, wrap(fn)),
  {
    skip: (
      title: string,
      fn: (fixture: TestFixture) => void | Promise<unknown>
    ) => _test.skip(title, wrap(fn)),
    only: (
      title: string,
      fn: (fixture: TestFixture) => void | Promise<unknown>
    ) => _test.only(title, wrap(fn)),
  }
);
