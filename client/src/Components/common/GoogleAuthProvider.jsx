import { GoogleOAuthProvider } from "@react-oauth/google";

const GoogleAuthProvider = ({ children }) => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return children;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>;
};

export default GoogleAuthProvider;
