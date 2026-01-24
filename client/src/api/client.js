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

// Log API URL for debugging (helps identify server URL)
console.log("🔗 API Server URL:", API_URL);
console.log("💡 To check server config, visit:", `${API_URL}/api/debug/env`);

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  try {
    if (token) {
      localStorage.setItem("token", token);
      // Force sync for iOS
      if (window.navigator.standalone) {
        // iOS PWA - ensure token is persisted
        setTimeout(() => {
          const saved = localStorage.getItem("token");
          if (saved !== token) {
            console.warn("Token not persisted, retrying...");
            localStorage.setItem("token", token);
          }
        }, 100);
      }
    } else {
      localStorage.removeItem("token");
    }
  } catch (e) {
    console.error("Failed to set token in localStorage:", e);
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
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, get text instead
        const text = await response.text();
        const error = new Error(`Request failed (${response.status} ${response.statusText}): ${text || "Unknown error"}`);
        error.response = { status: response.status, data: { error: text || "Unknown error" } };
        throw error;
      }
      
      // Format validation errors with details
      if (errorData.error === "Validation error" && errorData.details && Array.isArray(errorData.details)) {
        const messages = errorData.details.map((detail) => {
          const field = detail.path?.join(".") || "field";
          return `${field}: ${detail.message}`;
        });
        const error = new Error(messages.join(", "));
        error.response = { status: response.status, data: errorData };
        throw error;
      }
      
      // Create error with response data attached for role mismatch detection
      const error = new Error(errorData.error || `Request failed (${response.status})`);
      error.response = { status: response.status, data: errorData };
      throw error;
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
  put: (endpoint, data) => apiRequest(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  delete: (endpoint) => apiRequest(endpoint, { method: "DELETE" }),
  setToken,
  getToken,
};

