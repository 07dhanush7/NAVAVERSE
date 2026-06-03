import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import GoogleAuthButton from "../../Components/common/GoogleAuthButton";
import GoogleAuthProvider from "../../Components/common/GoogleAuthProvider";
const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
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

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || !email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/users/register", {
        name,
        email,
        password: form.password,
      });

      if (!data?.token) {
        toast.error("Registration failed");
        return;
      }

      await login(data.token);
      toast.success("Account created successfully");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="register-title">
        <p className="auth-kicker">Join NAVAVERSE</p>
        <h1 id="register-title">Create Account</h1>
        <p className="auth-subtitle">
          Start your futuristic platform journey with one secure NAVAVERSE identity.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            Name
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

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
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <GoogleAuthProvider>
          <GoogleAuthButton mode="register" />
        </GoogleAuthProvider>

        <p className="auth-bottom">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
