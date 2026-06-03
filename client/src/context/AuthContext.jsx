import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH PROFILE ================= */
const fetchProfile = async () => {
  try {
    const { data } = await axios.get("/users/profile");
    setUser(data?.user ?? null);
    return true;
  } catch (error) { 
    const status = error?.response?.status;

    // Only clear auth for truly invalid auth
    if (status === 401 || status === 403) {
      localStorage.removeItem("userToken");
      setUser(null);
    }

    return false;
  }
};
  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
  const initAuth = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (token) await fetchProfile();
    } finally {
      setLoading(false);
    }
  };
  initAuth();
}, []);

const login = async (token) => {
  localStorage.setItem("userToken", token);
  setLoading(true);
  try {
    await fetchProfile();
  } finally {
    setLoading(false);
  }
};

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("userToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);