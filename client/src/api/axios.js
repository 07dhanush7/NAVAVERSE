import axios from "axios";

export const backendUrl =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const apiOrigin = backendUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

export const apiBaseUrl = backendUrl.endsWith("/api") ? backendUrl : `${apiOrigin}/api`;

export const assetUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
};

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
});

axiosInstance.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");

  const url = config.url || "";

  const isAdminRoute =
    url.startsWith("/admin") ||
    url.startsWith("/blog/add") ||
    url.startsWith("/blog/toggle/") ||
    url.startsWith("/blog/featured/") ||
    url.startsWith("/blog/upcoming/") ||
    url.startsWith("/admin/blog/") ||
    url.startsWith("/blog/admin") ||
    url.startsWith("/subscription/notifications") ||
    url.startsWith("/subscription/notification/") ||
    url.startsWith("/jobs/admin/") ||
    url.startsWith("/events/admin/") ||
    url.startsWith("/courses/admin/") ||
    url.startsWith("/startups/admin/") ||
    url.startsWith("/event-registrations/admin") ||
    url.startsWith("/jobs/applicants/") ||
    url.startsWith("/jobs/application-status/") ||
    (url.startsWith("/startups/user/") && config.method?.toLowerCase() === "delete") ||
    (url.startsWith("/jobs/user/") && config.method?.toLowerCase() === "delete") ||
    (url.startsWith("/jobs/") && config.method?.toLowerCase() === "delete");

  if (adminToken && isAdminRoute) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }

  return config;
});

export default axiosInstance;


