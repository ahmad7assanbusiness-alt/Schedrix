const getApiUrl = () => {
  // #region agent log
  try {
    fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/client.js:1',message:'getApiUrl called',data:{isDev:import.meta.env.DEV,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  } catch(e) {}
  // #endregion
  const envUrl = import.meta.env.VITE_API_URL;
  // #region agent log
  try {
    fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/client.js:5',message:'API URL check',data:{hasEnvUrl:!!envUrl,envUrl:envUrl||'not set',isDev:import.meta.env.DEV,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  } catch(e) {}
  // #endregion
  if (envUrl) return envUrl;
  
  // Development fallback
  if (import.meta.env.DEV) {
    return "http://localhost:4000";
  }
  
  // Production fallback - don't throw error, use a default or show warning
  console.warn("VITE_API_URL environment variable is not set in production! Using fallback.");
  // Return empty string or a default - the app will still load but API calls will fail
  return "";
};

const API_URL = getApiUrl();
// #region agent log
try {
  fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/client.js:16',message:'API_URL initialized',data:{apiUrl:API_URL||'empty',timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
} catch(e) {}
// #endregion

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

