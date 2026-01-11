import type { PostWithLikesT } from "backend/database/schema.js";
import LikeButton from "./LikeButton.js";

export default (post: PostWithLikesT) => {
  return (
    <div
      key={post.id}
      style={{
        padding: "1rem",
        borderBottom: "1px solid #ccc",
        width: "100%", // Keep this at 100%
        maxWidth: "100%", // Ensure it doesn't get capped
        margin: "0", // Change from "0 auto" to "0" to align left/full
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "1rem",
      }}
    >
      <div style={{ flex: "1" }}>
        <div
          style={{
            wordBreak: "break-word",
            fontWeight: "500",
            whiteSpace: "pre-wrap",
            marginBottom: "0.5rem", // Added small gap for the button below
          }}
        >
          {post.content}
        </div>

        {/* Minimal Like Button */}
        <LikeButton post={post}></LikeButton>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          fontSize: "0.85rem",
          color: "#666",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        <div>Posted by: {post.author.slice(0, 8)}</div>
        {/* We'll wrap this in new Date() since we haven't run the migration yet */}
        <div>at {new Date(post.updatedAt).toLocaleTimeString()}</div>
      </div>
    </div>
  );
};
