import { html } from "hono/html";

export default () => {
  return html`
    <aside class="sidebar">
      <div class="logo">The Wall</div>
      <nav>
        <a href="/dashboard">Dashboard</a>
        <a href="/profile">Profile</a>
        <a href="/settings">Settings</a>
        <a href="/messages">Messages</a>
        <hr />
        <a href="/logout" class="logout">Logout</a>
      </nav>
    </aside>
  `;
};
