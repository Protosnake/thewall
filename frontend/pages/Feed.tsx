import type { PostT } from "backend/database/schema.js";
import { MAX_CHAR_FOR_POST } from "backend/schemas/feed.schema.js";
import Layout from "frontend/pages/Layout.js";

export default (props: { error?: string; posts?: PostT[] }) => {
  const { posts, error } = props;
  return (
    <Layout title="Feed">
      <form
        action="/post"
        method="post"
        style={{
          marginBottom: "2rem",
          maxWidth: "100%", // Fixed: use camelCase for style objects in JSX
        }}
        noValidate // Fixed: use camelCase for JSX attributes
      >
        <textarea
          id="post-content" // ADDED: Match the script's ID
          name="content"
          placeholder="What's on your mind?"
          maxLength={MAX_CHAR_FOR_POST}
          style={{
            width: "100%",
            minHeight: "120px",
            padding: "12px",
            resize: "vertical",
            boxSizing: "border-box", // Fixed: camelCase
          }}
        />

        {/* ADDED: Container for the character count */}
        <div
          style={{
            textAlign: "right",
            fontSize: "0.8rem",
            color: "#666",
            marginBottom: "0.5rem",
          }}
        >
          <span id="char-count">0</span>/{MAX_CHAR_FOR_POST}
        </div>

        <button type="submit" disabled>
          Post!
        </button>
        {error && <div className="error-msg">{error}</div>}
      </form>

      <div className="posts-list">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              style={{
                padding: "1rem",
                borderBottom: "1px solid #ccc",
                width: "100%",
                margin: "0 auto",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
              }}
            >
              {/* Content stays at the top/left by default */}
              <div
                style={{
                  wordBreak: "break-word",
                  flex: "1",
                  fontWeight: "500",
                }}
              >
                {post.content}
              </div>

              {/* Meta wrapper pushed to the right */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end", // This pushes children to the right
                  fontSize: "0.85rem",
                  color: "#666",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <div>Posted by: {post.author}</div>
                <div>at {post.updatedAt}</div>
              </div>
            </div>
          ))
        ) : (
          <p>No posts yet.</p>
        )}
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            const textarea = document.getElementById('post-content');
            const countSpan = document.getElementById('char-count');
            const submitBtn = document.querySelector('button[type="submit"]');
            
            if (textarea && countSpan && submitBtn) {
              // Run once on load to set initial state (e.g., if text remained after refresh)
              const update = () => {
                const length = textarea.value.length;
                countSpan.textContent = length;
                
                submitBtn.disabled = length > ${MAX_CHAR_FOR_POST};
                submitBtn.style.opacity = (length === 0 || length > ${MAX_CHAR_FOR_POST}) ? '0.5' : '1';
                
                if (length >= ${MAX_CHAR_FOR_POST}) {
                  countSpan.style.color = 'red';
                  countSpan.style.fontWeight = 'bold';
                } else if (length >= ${MAX_CHAR_FOR_POST - 20}) {
                  countSpan.style.color = 'orange';
                } else {
                  countSpan.style.color = 'inherit';
                  countSpan.style.fontWeight = 'normal';
                }
              };

              textarea.addEventListener('input', update);
              update(); // Initialize
            }
          `,
        }}
      />
    </Layout>
  );
};
