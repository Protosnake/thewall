import DatabaseClient from "backend/database/index.js";
import { test as _test, describe as _describe } from "bun:test";
import ApiClient from "testing/api/ApiClient.js";

export const describe = _describe;

type TestFixture = {
  db: DatabaseClient;
  apiClient: ApiClient;
};

// This helper ensures that the setup logic is wrapped consistently
// for both active and skipped tests.
const wrap = (fn: (fixture: TestFixture) => void | Promise<unknown>) => {
  return async () => {
    const db = new DatabaseClient(":memory:");
    const apiClient = new ApiClient(db);
    try {
      await fn({ db, apiClient });
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
