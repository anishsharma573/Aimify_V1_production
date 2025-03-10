// src/services/api.js (or any preferred file path)

import axios from "axios";

// Create an Axios instance with default config
const axiosInstance = axios.create({
    baseURL: "http://localhost:3000/api/v1",
    timeout: 10000,
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
    },
  }); 
  


// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Retrieve token from localStorage on each request
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[Request] ${config.method.toUpperCase()} ${config.url}`, config);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    const { response, config } = error;

    // Handle 401 Unauthorized - attempt token refresh
    if (response?.status === 401 && !config._retry) {
      config._retry = true;
      try {
        const { data } = await axiosInstance.post("/auth/refresh-token", {
          token: localStorage.getItem("refreshToken"),
        });
        // Update token in localStorage
        localStorage.setItem("token", data.token);
        // Update request header with new token
        config.headers.Authorization = `Bearer ${data.token}`;
        // Retry the original request
        return axiosInstance(config);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError.response?.data || refreshError.message);
        if (refreshError.response?.status === 401) {
          alert("Session expired. Please log in again.");
        }
        // Clear storage and force logout
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    // Handle 500 Internal Server Error - optional retry logic
    else if (response?.status === 500 && !config._retry) {
      config._retry = true;
      if (["GET", "HEAD"].includes(config.method.toUpperCase())) {
        console.warn("Retrying request...");
        return axiosInstance(config);
      }
    }
    // Handle request timeout
    else if (error.code === "ECONNABORTED") {
      console.error("Request timeout:", error.message);
      alert("The server took too long to respond. Please try again.");
    }

    console.error(`[Error] ${error.config?.url}`, response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
