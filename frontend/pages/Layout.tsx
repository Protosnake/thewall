// frontend/components/Layout.tsx
import type { Child } from "hono/jsx";

interface LayoutProps {
  title: string;
  children: Child; // "Child" is the Hono JSX type for content
}

export default ({ title, children }: LayoutProps) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/styles/index.css" />
        <title>{title}</title>
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a class="right" href="/logout">
            Logout
          </a>
        </nav>
        <div class="container">
          <aside class="sidebar">
            <nav>
              <a href="/messages">Messages</a>
              <a href="/profile">Profile</a>
              <a href="/settings">Settings</a>
            </nav>
          </aside>
          <main>{children}</main>
        </div>
        <footer
          style={{ textAlign: "center", padding: "2rem", fontSize: "0.8rem" }}
        >
          © {new Date().getFullYear()} TheWall(c)
        </footer>
      </body>
    </html>
  );
};
