import type { PostT } from "backend/database/schema.js";

export default (post: PostT) => {
  return (
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
      <div
        style={{
          wordBreak: "break-word",
          flex: "1",
          fontWeight: "500",
          whiteSpace: "pre-wrap",
        }}
      >
        {post.content}
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
        {/* Updated to use authorEmail if available, falling back to ID */}
        <div>Posted by: {post.author}</div>
        <div>at {post.updatedAt}</div>
      </div>
    </div>
  );
};
