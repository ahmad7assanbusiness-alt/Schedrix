import { useState, useEffect } from "react";
import { api } from "../api/client.js";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore user from localStorage first (for faster initial load)
    const savedUser = localStorage.getItem("user");
    const savedBusiness = localStorage.getItem("business");
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        if (savedBusiness) {
          setBusiness(JSON.parse(savedBusiness));
        }
      } catch (e) {
        console.error("Failed to parse saved user:", e);
      }
    }
    
    // Then verify with server
    const token = api.getToken();
    if (token) {
      loadUser();
    } else {
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
        localStorage.setItem("user", JSON.stringify(user));
      }
      if (business) {
        localStorage.setItem("business", JSON.stringify(business));
      }
    } catch (error) {
      api.setToken(null);
      setUser(null);
      setBusiness(null);
      // Clear localStorage on error
      localStorage.removeItem("user");
      localStorage.removeItem("business");
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

