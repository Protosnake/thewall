import { html } from "hono/html";
import base from "./index.js";

export default (props: { email?: string; error?: string } = {}) => {
  const { error, email = "" } = props;
  return base({
    title: "Sign up",
    content: html`
      <form action="/signup" method="POST" style="width: 20rem">
        <label for="email">Email</label>
        <input type="email" name="email" id="email" value="${email}" />
        <label for="password">Password</label>
        <input type="password" name="password" id="password" />
        <label for="repeatPassword">Repeat password</label>
        <input type="password" name="repeatPassword" id="repeat-password" />
        <button type="submit">Sign up</button>
        <a href="/login">Already have an account?</a>
      </form>
      ${!!error ? html`<div class="error-msg">${error}</div>` : ""}
    `,
  });
};
