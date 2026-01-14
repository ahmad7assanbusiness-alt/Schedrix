import { useState, useEffect } from "react";
import { api } from "../api/client.js";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    } catch (error) {
      api.setToken(null);
      setUser(null);
      setBusiness(null);
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
  }

  return { user, business, loading, login, logout, reload: loadUser };
}

