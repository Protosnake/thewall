import type ApiClient from "../ApiClient.js";
import assert from "assert";

export default abstract class {
  protected response: Response | null = null;
  constructor(protected api: ApiClient) {}

  protected abstract get path(): string;
  hasPath(expectedPath: string) {
    assert(this.response, `Unexpected null response`);

    const actualPath = new URL(this.response.url).pathname;

    // Ensure both paths start with exactly one slash for the comparison
    const normalize = (p: string) => (p.startsWith("/") ? p : `/${p}`);

    assert.strictEqual(
      normalize(actualPath),
      normalize(expectedPath),
      `Path mismatch!`
    );
  }
  expectStatus(code: number) {
    assert.strictEqual(this.response?.status, code);
    return this;
  }
}
