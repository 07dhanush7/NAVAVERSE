import { useNavigate } from "react-router-dom";
const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="header">
      <div className="header-content">
        <div className="header-badge">
          <p>AI-Driven Platform for Tech Creators & Innovators</p>
        </div>

        <h1 className="header-title">
          Ideas That Spark
          <br />
          <span>Innovation & Collaboration</span>
        </h1>

        <p className="header-description">
          Discover AI-powered content, share knowledge, and connect with
          innovators building the future of technology.
        </p>

        <div className="header-actions">
          <button className="header-button" onClick={() => navigate("/blogs")}>
            Explore Blogs
          </button>

          <button className="header-button" onClick={() => navigate("/tech")}>
            Explore Tech
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;


