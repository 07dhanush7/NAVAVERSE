import { Link } from "react-router-dom";
const AuthPrompt = ({
  title = "Please login to access full content",
  description = "Sign in to continue with the complete NAVAVERSE experience.",
  compact = false,
}) => {
  return (
    <div className={`auth-prompt ${compact ? "auth-prompt-compact" : ""}`}>
      <p className="auth-prompt-title">{title}</p>
      <p className="auth-prompt-description">{description}</p>
      <Link to="/login" className="btn-primary auth-prompt-button">
        Login
      </Link>
    </div>
  );
};

export default AuthPrompt;