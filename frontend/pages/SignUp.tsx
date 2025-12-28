import LoadingIndicator from "frontend/components/LoadingIndicator.js";
import Layout from "./Layout.js";

export default (props: { email?: string } = {}) => {
  const { email = "" } = props;

  return (
    <Layout title="Sign up">
      <form
        hx-post="/signup"
        hx-target="this"
        hx-swap="none"
        style={{ width: "20rem" }}
      >
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" value={email} />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />

        <label htmlFor="repeatPassword">Repeat password</label>
        <input type="password" name="repeatPassword" id="repeat-password" />

        <div id="form-error"></div>
        <button type="submit">
          Sign up
          <LoadingIndicator />
        </button>
        <a href="/login">Already have an account?</a>
      </form>
    </Layout>
  );
};
