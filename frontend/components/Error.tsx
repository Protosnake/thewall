export default (props: { error: string }) => {
  const { error } = props;
  return (
    <div id="form-error" className="error-msg" hx-swap-oob="true">
      {error && (
        <div
          style={{
            backgroundColor: "#ef4444",
            color: "#ffffff",
            padding: "0.75rem",
            marginBottom: "0px",
            fontSize: "0.9rem",
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};
