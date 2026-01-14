const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  
  // Development fallback
  if (import.meta.env.DEV) {
    return "http://localhost:4000";
  }
  
  // Production safety check
  console.error("VITE_API_URL environment variable is not set in production!");
  throw new Error("API URL is not configured. Please set VITE_API_URL environment variable.");
};

const API_URL = getApiUrl();

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      setToken(null);
      window.location.href = "/welcome";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      
      // Format validation errors with details
      if (error.error === "Validation error" && error.details && Array.isArray(error.details)) {
        const messages = error.details.map((detail) => {
          const field = detail.path?.join(".") || "field";
          return `${field}: ${detail.message}`;
        });
        throw new Error(messages.join(", "));
      }
      
      throw new Error(error.error || "Request failed");
    }

    return response.json();
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      const apiUrl = API_URL || "the API server";
      throw new Error(`Cannot connect to server at ${apiUrl}. Please check your network connection and API configuration.`);
    }
    throw error;
  }
}

export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: "GET" }),
  post: (endpoint, data) => apiRequest(endpoint, { method: "POST", body: JSON.stringify(data) }),
  setToken,
  getToken,
};

