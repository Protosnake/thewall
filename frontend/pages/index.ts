import { html } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";

export default (props: {
  title: string;
  content: HtmlEscapedString | Promise<HtmlEscapedString>;
}) => {
  const { title, content } = props;

  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/styles/index.css" />
        <title>${title}</title>
      </head>
      <body>
        <nav style="padding: 1rem; border-bottom: 1px solid #eee;">
          <a href="/">Home</a>
          <a href="/feed">Feed</a>
          <a href="/logout">Logout</a>
        </nav>

        <main>${content}</main>

        <footer style="text-align: center; padding: 2rem; font-size: 0.8rem;">
          © ${new Date().getFullYear()} TheWall(c)
        </footer>
      </body>
    </html>
  `;
};
