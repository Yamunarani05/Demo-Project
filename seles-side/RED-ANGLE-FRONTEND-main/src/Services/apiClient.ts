// src/Services/apiClient.ts
import axios from "axios";
import { tokenService } from "./tokenService";

// prefer env if set, otherwise fallback
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization header from tokenService (now using "token" key)
apiClient.interceptors.request.use((config) => {
  const token = tokenService.getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
