import type { PostWithLikesT } from "backend/database/schema.js";

// frontend/components/LikeButton.js
export default ({ post }: { post: PostWithLikesT }) => {
  // Explicitly cast to boolean to handle 0/1 or "0"/"1"
  const isRed = Boolean(post.isLiked);

  return (
    <button
      hx-post={`/posts/${post.id}/like`}
      hx-swap="outerHTML"
      style={{
        background: "none",
        border: "1px solid #eee",
        cursor: "pointer",
        borderRadius: "4px",
        padding: "2px 6px",
        // Use the strictly casted boolean
        color: isRed ? "red" : "#666",
      }}
    >
      {isRed ? "❤️" : "🤍"} {post.likeCount}
    </button>
  );
};
