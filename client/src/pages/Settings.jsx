import { Outlet, NavLink } from "react-router-dom";
import "../index.css";

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
    color: "var(--gray-600)",
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
    background: "white",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-md)",
    boxShadow: "var(--shadow-sm)",
  },
  navLink: {
    display: "block",
    padding: "var(--spacing-md)",
    borderRadius: "var(--radius-md)",
    color: "var(--gray-700)",
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
    background: "white",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-2xl)",
    boxShadow: "var(--shadow-sm)",
  },
};

export default function Settings() {
  const settingsPages = [
    { path: "profile", label: "Profile" },
    { path: "calendar", label: "Calendar" },
    { path: "security", label: "Security Center" },
    { path: "billing", label: "Billing" },
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
        <aside style={styles.sidebar}>
          <nav style={styles.nav}>
            {settingsPages.map((page) => (
              <NavLink
                key={page.path}
                to={`/settings/${page.path}`}
                end={page.path === "profile"}
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
              >
                {page.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main style={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
