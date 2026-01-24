import { useState, useEffect } from "react";
import { api } from "../api/client.js";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // iOS PWA fix: Ensure localStorage is accessible
    const isIOSPWA = window.navigator.standalone;
    
    // iOS-specific: Retry localStorage access if it fails
    const getLocalStorageItem = (key, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          if (i === retries - 1) throw e;
          // Wait a bit and retry for iOS
          if (isIOSPWA) {
            return new Promise((resolve) => {
              setTimeout(() => {
                try {
                  resolve(localStorage.getItem(key));
                } catch {
                  resolve(null);
                }
              }, 100 * (i + 1));
            });
          }
        }
      }
      return null;
    };
    
    // Try to restore user from localStorage first (for faster initial load)
    let savedUser = null;
    let savedBusiness = null;
    let token = null;
    
    try {
      savedUser = getLocalStorageItem("user");
      savedBusiness = getLocalStorageItem("business");
      token = api.getToken();
    } catch (e) {
      console.error("localStorage access error:", e);
      // If localStorage fails, clear everything and start fresh
      setLoading(false);
      return;
    }
    
    // Handle async result for iOS
    if (savedUser instanceof Promise) {
      savedUser.then((user) => {
        if (user) {
          try {
            const parsedUser = JSON.parse(user);
            setUser(parsedUser);
          } catch (e) {
            console.error("Failed to parse saved user:", e);
          }
        }
      });
      savedUser = null; // Will be handled async
    } else if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (savedBusiness && !(savedBusiness instanceof Promise)) {
          setBusiness(JSON.parse(savedBusiness));
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
      if (savedUser && !(savedUser instanceof Promise)) {
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
    const isIOSPWA = window.navigator.standalone;
    
    try {
      const { user, business } = await api.get("/auth/me");
      setUser(user);
      setBusiness(business);
      // Update localStorage with fresh data (with retry for iOS)
      if (user) {
        try {
          localStorage.setItem("user", JSON.stringify(user));
          // iOS: Verify persistence
          if (isIOSPWA) {
            setTimeout(() => {
              const saved = localStorage.getItem("user");
              if (!saved || JSON.parse(saved).id !== user.id) {
                console.warn("User not persisted on iOS, retrying...");
                localStorage.setItem("user", JSON.stringify(user));
              }
            }, 200);
          }
        } catch (e) {
          console.error("Failed to save user to localStorage:", e);
        }
      }
      if (business) {
        try {
          localStorage.setItem("business", JSON.stringify(business));
          // iOS: Verify persistence
          if (isIOSPWA) {
            setTimeout(() => {
              const saved = localStorage.getItem("business");
              if (!saved || JSON.parse(saved).id !== business.id) {
                console.warn("Business not persisted on iOS, retrying...");
                localStorage.setItem("business", JSON.stringify(business));
              }
            }, 200);
          }
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

