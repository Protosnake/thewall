import Route from "./Route.js";

export default class extends Route {
  protected get path() {
    return `/login`;
  }
  async login(payload: { email?: string; password?: string }): Promise<this> {
    this.response = await this.api.post(this.path, payload);
    return this;
  }
}
