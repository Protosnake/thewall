import { html } from "hono/html";
import base from "./index.js";

export default (props: { isError?: boolean } = {}) => {
  const { isError } = props;

  return base({
    title: "Login",
    content: html`
      <form action="/login" method="POST" style="width: 20rem">
        <label for="email">Email</label>
        <input type="email" name="email" id="email" />
        <label for="password">Password</label>
        <input type="password" name="password" id="password" />
        <button type="submit">Log in</button>
        <a href="/singUp">Don't have an account?</a>
      </form>
      ${isError
        ? html`<div class="error-msg">Wrong credentials, try again</div>`
        : ""}
    `,
  });
};
