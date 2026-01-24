import { useState, useEffect } from "react";
import { api } from "../api/client.js";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore user from localStorage first (for faster initial load)
    let savedUser = null;
    let savedBusiness = null;
    let token = null;
    
    try {
      savedUser = localStorage.getItem("user");
      savedBusiness = localStorage.getItem("business");
      token = api.getToken();
    } catch (e) {
      console.error("localStorage access error:", e);
      // If localStorage fails, just continue without cached data
      setLoading(false);
      return;
    }
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (savedBusiness) {
          try {
            setBusiness(JSON.parse(savedBusiness));
          } catch (e) {
            console.error("Failed to parse saved business:", e);
          }
        }
      } catch (e) {
        console.error("Failed to parse saved user:", e);
        // Clear corrupted data
        try {
          localStorage.removeItem("user");
          localStorage.removeItem("business");
        } catch {}
      }
    }
    
    // Then verify with server if we have a token
    if (token) {
      loadUser();
    } else {
      // No token - clear any stale user data
      if (savedUser) {
        try {
          localStorage.removeItem("user");
          localStorage.removeItem("business");
        } catch {}
        setUser(null);
        setBusiness(null);
      }
      setLoading(false);
    }
  }, []);

  async function loadUser() {
    try {
      const { user, business } = await api.get("/auth/me");
      setUser(user);
      setBusiness(business);
      // Update localStorage with fresh data
      if (user) {
        try {
          localStorage.setItem("user", JSON.stringify(user));
        } catch (e) {
          console.error("Failed to save user to localStorage:", e);
        }
      }
      if (business) {
        try {
          localStorage.setItem("business", JSON.stringify(business));
        } catch (e) {
          console.error("Failed to save business to localStorage:", e);
        }
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      // Only clear if it's an auth error, not network error
      if (error.message === "Unauthorized" || error.response?.status === 401) {
        api.setToken(null);
        setUser(null);
        setBusiness(null);
        // Clear localStorage on auth error
        try {
          localStorage.removeItem("user");
          localStorage.removeItem("business");
          localStorage.removeItem("token");
        } catch (e) {
          console.error("Failed to clear localStorage:", e);
        }
      } else {
        // Network error - keep existing user data but mark as potentially stale
        console.warn("Network error loading user, keeping cached data");
      }
    } finally {
      setLoading(false);
    }
  }

  function login(token, userData, businessData) {
    api.setToken(token);
    setUser(userData);
    setBusiness(businessData);
  }

  function logout() {
    api.setToken(null);
    setUser(null);
    setBusiness(null);
    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("business");
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return { user, business, loading, login, logout, reload: loadUser, updateUser };
}

