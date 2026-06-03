import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import toast from "react-hot-toast";
const AdminLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post("/admin/login", form);

      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminEmail", form.email);

        toast.success("Admin Login Successful");
        navigate("/admin", { replace: true });
      } else {
        toast.error(data.message || "Login Failed");
      }
    } catch {
      toast.error("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="blog-card admin-login-card">
        <h2>Admin Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="Enter Email"
              required
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="Enter Password"
              required
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;



