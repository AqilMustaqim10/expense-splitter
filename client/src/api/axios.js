import axios from "axios";

// ─── Axios Instance ────────────────────────────────────────────────────────────
// Uses environment variable so we can switch between dev and production
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Automatically attaches JWT token to every request if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
