import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../api/axios";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/users/forgot-password", {
        email: email.trim(),
      });
      setMessage(data?.message || "Password reset link sent.");
      setDevResetUrl(data?.devResetUrl || "");
      toast.success("Check your email for the reset link");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="forgot-title">
        <p className="auth-kicker">Account Recovery</p>
        <h1 id="forgot-title">Forgot Password</h1>
        <p className="auth-subtitle">
          Enter your registered email and we&apos;ll send a secure reset link.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}
        {devResetUrl && (
          <p className="auth-message">
            Dev reset link: <a href={devResetUrl}>{devResetUrl}</a>
          </p>
        )}

        <p className="auth-bottom">
          Remembered it? <Link to="/login">Back to login</Link>
        </p>
      </section>
    </main>
  );
};

export default ForgotPassword;
