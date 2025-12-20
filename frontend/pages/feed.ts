import { html } from "hono/html";
import base from "./index.js";

export default () => {
  return base({ title: "Feed", content: html` <h3>Your feed</h3> ` });
};
