// frontend/pages/Feed.tsx
import type { PostT } from "backend/database/schema.js";
import Layout from "frontend/pages/Layout.js";

export default (props: { error?: string; posts?: PostT[] }) => {
  const { posts, error } = props;
  return (
    <Layout title="Feed">
      <h1>Your feed</h1>
      <form
        action="/post"
        method="post"
        style={{ marginBottom: "2rem" }}
        novalidate
      >
        <input
          type="text"
          name="content" // Changed to 'content' to match typical DB column names
          placeholder="What's on your mind?"
        />
        <button type="submit">Post!</button>
        {error && <div className="error-msg">{error}</div>}
      </form>

      <div class="posts-list">
        {posts && posts?.length > 0 ? (
          posts.map((post) => (
            <div style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
              {post.content}
            </div>
          ))
        ) : (
          <p>No posts yet. Be the first!</p>
        )}
      </div>
    </Layout>
  );
};
