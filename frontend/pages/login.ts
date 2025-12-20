import { html } from "hono/html";
import base from "./index.js";

export default (props: { isError?: boolean } = {}) => {
  const { isError } = props;

  return base({
    title: "Login",
    content: html`
      <form action="/login" method="POST">
        ${isError
          ? html`<div style="color: red; margin-bottom: 1rem;">
              Wrong credentials, try again
            </div>`
          : ""}
        <label for="email">Email</label>
        <input type="email" name="email" id="email" />
        <label for="password">Password</label>
        <input type="password" name="password" id="password" />
        <button type="submit">Log in</button>
      </form>
    `,
  });
};
