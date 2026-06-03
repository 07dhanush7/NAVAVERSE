import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ContributorRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const adminToken = localStorage.getItem("adminToken");

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user && !adminToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ContributorRoute;