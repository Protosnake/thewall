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
        <link rel="stylesheet" href="/styles/index.css" />
        <title>${title}</title>
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/feed">Feed</a>
          <a class="right" href="/logout">Logout</a>
        </nav>
        <div class="container">
          <aside class="sidebar">
            <nav>
              <a class="left" href="/dashboard">Dashboard</a>
              <a class="left" href="/profile">Profile</a>
              <a class="left" href="/settings">Settings</a>
              <a class="left" href="/messages">Messages</a>
            </nav>
          </aside>
          <main>${content}</main>
        </div>
        <footer style="text-align: center; padding: 2rem; font-size: 0.8rem;">
          © ${new Date().getFullYear()} TheWall(c)
        </footer>
      </body>
    </html>
  `;
};
