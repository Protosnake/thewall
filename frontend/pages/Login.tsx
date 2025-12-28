import LoadingIndicator from "frontend/components/LoadingIndicator.js";
import Layout from "./Layout.js";

export default (props?: { error?: string; email?: string }) => {
  return (
    <Layout title="Login">
      <form
        hx-post="/login"
        hx-target="this"
        hx-swap="none"
        style={{ width: "20rem" }}
      >
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" value={props?.email} />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />

        <button type="submit">
          Log in
          <LoadingIndicator />
        </button>
        <div id="form-error"></div>
        <a href="/signup">Don't have an account?</a>
      </form>
    </Layout>
  );
};
