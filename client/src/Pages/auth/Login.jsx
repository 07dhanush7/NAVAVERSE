import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import GoogleAuthButton from "../../Components/common/GoogleAuthButton";
import GoogleAuthProvider from "../../Components/common/GoogleAuthProvider";
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/users/login", { email, password });

      if (!data?.token) {
        toast.error("Login failed");
        return;
      }

      await login(data.token);
      toast.success("Login successful");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <p className="auth-kicker">NAVAVERSE Access</p>
        <h1 id="login-title">Welcome Back</h1>
        <p className="auth-subtitle">
          Sign in to continue exploring blogs, jobs, events, courses, and startup spaces.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            Email
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="auth-field">
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <div className="auth-row">
            <Link className="auth-link" to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <GoogleAuthProvider>
          <GoogleAuthButton mode="login" />
        </GoogleAuthProvider>

        <p className="auth-bottom">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
