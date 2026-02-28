import axios from "axios";

// ─── Axios Instance ────────────────────────────────────────────────────────────
// Create a reusable axios instance pointing to our backend API
const API = axios.create({
  baseURL: "http://localhost:5000/api", // All requests will be prefixed with this
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Runs before every request — automatically attaches the JWT token if it exists
// This means the user stays "logged in" across page refreshes
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token"); // Get saved token from browser
  if (token) {
    req.headers.Authorization = `Bearer ${token}`; // Attach token to request header
  }
  return req;
});

export default API;
