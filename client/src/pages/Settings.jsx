import { Outlet, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth.js";
import "../index.css";

// Detect iPhone Safari specifically
const isIphoneSafari = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS/.test(ua);
  const isStandalone = window.navigator.standalone;
  // Only detect Safari browser, not PWA
  return isIOS && isSafari && !isStandalone;
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "var(--spacing-2xl)",
  },
  title: {
    fontSize: "var(--font-size-3xl)",
    fontWeight: 800,
    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "var(--spacing-sm)",
  },
  subtitle: {
    color: "var(--text-secondary)",
    fontSize: "var(--font-size-base)",
  },
  content: {
    display: "flex",
    gap: "var(--spacing-xl)",
  },
  sidebar: {
    width: "250px",
    flexShrink: 0,
  },
  nav: {
    background: "var(--bg-primary)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-md)",
    boxShadow: "var(--shadow-sm)",
  },
  navLink: {
    display: "block",
    padding: "var(--spacing-md)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)",
    textDecoration: "none",
    transition: "all var(--transition-base)",
    marginBottom: "var(--spacing-xs)",
    fontSize: "var(--font-size-base)",
  },
  navLinkActive: {
    background: "var(--primary-light)",
    color: "var(--primary)",
    fontWeight: 600,
  },
  main: {
    flex: 1,
    background: "var(--bg-primary)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-2xl)",
    boxShadow: "var(--shadow-sm)",
  },
  mainFullWidth: {
    flex: 1,
    background: "var(--bg-primary)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-2xl)",
    boxShadow: "var(--shadow-sm)",
    width: "100%",
  },
};

export default function Settings() {
  const { user } = useAuth();
  const [isIphone, setIsIphone] = useState(false);
  const isManager = user?.role === "OWNER" || user?.role === "MANAGER";

  useEffect(() => {
    setIsIphone(isIphoneSafari());
  }, []);
  
  const settingsPages = [
    { path: "profile", label: "Profile" },
    { path: "calendar", label: "Calendar" },
    { path: "security", label: "Security Center" },
    ...(isManager ? [{ path: "billing", label: "Billing" }] : []),
    { path: "support", label: "Support" },
    { path: "legal", label: "Legal" },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>Manage your account and preferences</p>
      </div>

      <div style={styles.content}>
        {!isIphone && (
          <aside style={styles.sidebar}>
            <nav style={styles.nav}>
              {settingsPages.map((page) => {
                // Determine the base path based on user role
                const basePath = isManager ? "/dashboard/settings" : "/employee/settings";
                return (
                  <NavLink
                    key={page.path}
                    to={`${basePath}/${page.path}`}
                    end={page.path === "profile"}
                    style={({ isActive }) => ({
                      ...styles.navLink,
                      ...(isActive ? styles.navLinkActive : {}),
                    })}
                  >
                    {page.label}
                  </NavLink>
                );
              })}
            </nav>
          </aside>
        )}

        <main style={isIphone ? styles.mainFullWidth : styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
