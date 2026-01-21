import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import "../index.css";

const styles = {
  sidebar: {
    width: "280px",
    minHeight: "100vh",
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    borderRight: "1px solid var(--gray-200)",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 100,
    boxShadow: "2px 0 8px rgba(0, 0, 0, 0.05)",
  },
  logo: {
    padding: "var(--spacing-xl)",
    borderBottom: "1px solid var(--gray-200)",
    marginBottom: "var(--spacing-lg)",
  },
  logoText: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 800,
    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  navSection: {
    padding: "0 var(--spacing-lg)",
    marginBottom: "var(--spacing-xl)",
  },
  navSectionTitle: {
    fontSize: "var(--font-size-xs)",
    fontWeight: 700,
    color: "var(--gray-500)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "var(--spacing-md)",
    paddingLeft: "var(--spacing-md)",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-md)",
    padding: "var(--spacing-md)",
    borderRadius: "var(--radius-md)",
    color: "var(--gray-700)",
    textDecoration: "none",
    transition: "all var(--transition-base)",
    marginBottom: "var(--spacing-xs)",
    fontSize: "var(--font-size-base)",
    fontWeight: 500,
  },
  navLinkActive: {
    background: "var(--primary-light)",
    color: "var(--primary)",
    fontWeight: 600,
  },
  navLinkHover: {
    background: "var(--gray-50)",
  },
  icon: {
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "var(--font-size-lg)",
  },
  userSection: {
    marginTop: "auto",
    padding: "var(--spacing-lg)",
    borderTop: "1px solid var(--gray-200)",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-md)",
    marginBottom: "var(--spacing-md)",
  },
  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 700,
    fontSize: "var(--font-size-lg)",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: 600,
    color: "var(--gray-900)",
    fontSize: "var(--font-size-sm)",
  },
  userRole: {
    fontSize: "var(--font-size-xs)",
    color: "var(--gray-500)",
    textTransform: "capitalize",
  },
  logoutButton: {
    width: "100%",
    padding: "var(--spacing-sm) var(--spacing-md)",
    background: "var(--error-light)",
    color: "var(--error)",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all var(--transition-base)",
    "&:hover": {
      background: "var(--error)",
      color: "white",
    },
  },
};

export default function SideNav({ onLogout }) {
  const location = useLocation();
  const { user, business } = useAuth();

  const isManager = user?.role === "OWNER" || user?.role === "MANAGER";

  if (!isManager) return null;

  const mainNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/schedule", label: "Schedule Builder", icon: "📅" },
    { path: "/employees", label: "Employees", icon: "👥" },
  ];

  const settingsNavItems = [
    { path: "/settings/profile", label: "Profile", icon: "👤" },
    { path: "/settings/calendar", label: "Calendar", icon: "📆" },
    { path: "/settings/security", label: "Security Center", icon: "🔒" },
    { path: "/settings/billing", label: "Billing", icon: "💳" },
    { path: "/settings/support", label: "Support", icon: "💬" },
    { path: "/settings/legal", label: "Legal", icon: "⚖️" },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    if (path.startsWith("/settings")) {
      return location.pathname.startsWith("/settings");
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoText}>Schedrix</div>
      </div>

      <div style={styles.navSection}>
        {mainNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.navLink,
              ...(isActive(item.path) ? styles.navLinkActive : {}),
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = "var(--gray-50)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div style={styles.navSection}>
        <div style={styles.navSectionTitle}>Settings</div>
        {settingsNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.navLink,
              ...(isActive(item.path) ? styles.navLinkActive : {}),
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = "var(--gray-50)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div style={styles.userDetails}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{user?.role?.toLowerCase()}</div>
          </div>
        </div>
        <button onClick={onLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </nav>
  );
}
