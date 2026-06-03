import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.put(`/users/reset-password/${token}`, {
        password: form.password,
      });

      if (data?.token) {
        await login(data.token);
      }

      toast.success(data?.message || "Password reset successful");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="reset-title">
        <p className="auth-kicker">Secure Reset</p>
        <h1 id="reset-title">Reset Password</h1>
        <p className="auth-subtitle">
          Create a new password for your NAVAVERSE account.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            New Password
            <input
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <label className="auth-field">
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repeat new password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="auth-bottom">
          Link expired? <Link to="/forgot-password">Request a new one</Link>
        </p>
      </section>
    </main>
  );
};

export default ResetPassword;
