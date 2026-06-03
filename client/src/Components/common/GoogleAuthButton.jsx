import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const GoogleAuthButton = ({ mode = "login" }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const containerRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(392);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const updateWidth = () => {
      setButtonWidth(Math.min(392, Math.max(240, containerRef.current.offsetWidth)));
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error("Google authentication failed");
      return;
    }

    try {
      const { data } = await axios.post("/users/google", {
        credential: credentialResponse.credential,
      });

      if (!data?.token) {
        toast.error("Google authentication failed");
        return;
      }

      await login(data.token);
      toast.success(mode === "register" ? "Account created successfully" : "Login successful");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Google authentication failed");
    }
  };

  const handleError = () => {
    toast.error("Google authentication was cancelled or failed");
  };

  if (!googleClientId) {
    return (
      <button type="button" className="google-auth-fallback" disabled>
        Google login is not configured
      </button>
    );
  }

  return (
    <div className="google-auth-button" ref={containerRef}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text={mode === "register" ? "signup_with" : "signin_with"}
        shape="pill"
        size="large"
        theme="filled_blue"
        width={String(buttonWidth)}
        useOneTap={false}
      />
    </div>
  );
};

export default GoogleAuthButton;
