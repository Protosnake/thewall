import Layout from "./Layout.js";

export default (props?: { error?: string; email?: string }) => {
  return (
    <Layout title="Login">
      <form action="/login" method="post" style={{ width: "20rem" }}>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" value={props?.email} />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />

        <button type="submit">Log in</button>
        <a href="/signup">Don't have an account?</a>
      </form>
      {props?.error && <div className="error-msg">{props.error}</div>}
    </Layout>
  );
};
