import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api",
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {

    // Handle 401 Unauthorized errors (ignore if in demo portal mode)
    if (error.response?.status === 401 && localStorage.getItem("isDemoPortal") !== "true") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    // Handle 400 Bad Request
    if (error.response?.status === 400) {
      console.error("Bad Request:", error.response.data);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error("Resource Not Found:", error.response.config.url);
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error("Server Error:", error.response.data);
    }

    const formattedError = {
      message:
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred",
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    };

    return Promise.reject(formattedError);
  }
);

// Test API connection helper (optional)
export const testApiConnection = async () => {
  try {
    const response = await api.get("/health");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
};

// Lead update helper with retry (PUT then PATCH)
export const updateLeadWithRetry = async (leadId: string, data: any) => {
  try {
    return await api.put(`/leads/${leadId}`, data);
  } catch (putError: any) {
    console.log("PUT failed, trying PATCH:", putError.message);

    try {
      return await api.patch(`/leads/${leadId}`, data);
    } catch (patchError: any) {
      console.log("PATCH also failed:", patchError.message);
      throw putError;
    }
  }
};

// Helper to format errors for display
export const formatErrorMessage = (error: any): string => {
  if (!error) return "Unknown error occurred";

  if (typeof error === "string") return error;

  if (error.message) return error.message;

  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (data?.message) {
      return `${status} Error: ${data.message}`;
    }

    return `Request failed with status ${status}`;
  }

  if (error.request) {
    return "Network error. Please check your internet connection.";
  }

  return "An unexpected error occurred. Please try again.";
};

// Export both default and named api
export { api };
export default api;
