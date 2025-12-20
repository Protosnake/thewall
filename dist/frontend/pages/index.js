import { html } from "hono/html";
export default (props) => {
    const { title, content } = props;
    return html `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/styles/index.css" />
        <title>${title}</title>
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/feed">Feed</a>
          <a class="right" href="/logout">Logout</a>
        </nav>

        <main class="container">${content}</main>

        <footer style="text-align: center; padding: 2rem; font-size: 0.8rem;">
          © ${new Date().getFullYear()} TheWall(c)
        </footer>
      </body>
    </html>
  `;
};
