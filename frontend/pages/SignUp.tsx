import Layout from "./Layout.js";

export default (props: { email?: string; error?: string } = {}) => {
  const { error, email = "" } = props;

  return (
    <Layout title="Sign up">
      <form action="/signup" method="post" style={{ width: "20rem" }}>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" value={email} />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />

        <label htmlFor="repeatPassword">Repeat password</label>
        <input type="password" name="repeatPassword" id="repeat-password" />

        <button type="submit">Sign up</button>
        <a href="/login">Already have an account?</a>
      </form>
      {error && <div className="error-msg">{error}</div>}
    </Layout>
  );
};
