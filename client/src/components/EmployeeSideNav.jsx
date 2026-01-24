import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/useAuth.js";
import { useTheme } from "../contexts/ThemeContext.jsx";
import "../index.css";

const styles = {
  sidebar: {
    width: "280px",
    height: "100vh",
    background: "var(--bg-primary)",
    backdropFilter: "blur(20px)",
    borderRight: "1px solid var(--gray-200)",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 100,
    boxShadow: "2px 0 8px rgba(0, 0, 0, 0.05)",
    overflowY: "auto",
    overflowX: "hidden",
    transform: "translateX(0)",
    transition: "transform var(--transition-base)",
  },
  sidebarMobile: {
    width: "280px",
    transform: "translateX(-100%)",
  },
  sidebarMobileOpen: {
    transform: "translateX(0)",
  },
  logo: {
    padding: "var(--spacing-xl)",
    borderBottom: "1px solid var(--gray-200)",
    marginBottom: "var(--spacing-lg)",
    flexShrink: 0,
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
    flexShrink: 0,
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
    color: "var(--text-secondary)",
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
  themeToggle: {
    padding: "var(--spacing-md)",
    marginBottom: "var(--spacing-md)",
    borderRadius: "var(--radius-md)",
    border: "2px solid var(--gray-200)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--spacing-sm)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 500,
    transition: "all var(--transition-base)",
    width: "100%",
  },
  userSection: {
    marginTop: "auto",
    padding: "var(--spacing-lg)",
    borderTop: "1px solid var(--gray-200)",
    flexShrink: 0,
    background: "var(--bg-primary)",
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
    background: "linear-gradient(135deg, var(--secondary) 0%, #7c3aed 100%)",
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
    color: "var(--text-primary)",
    fontSize: "var(--font-size-sm)",
  },
  userRole: {
    fontSize: "var(--font-size-xs)",
    color: "var(--text-secondary)",
    textTransform: "capitalize",
  },
  userSectionClickable: {
    cursor: "pointer",
    transition: "all var(--transition-base)",
  },
  userSectionClickableHover: {
    background: "var(--gray-50)",
  },
  dropdown: {
    position: "absolute",
    bottom: "80px",
    left: "var(--spacing-lg)",
    right: "var(--spacing-lg)",
    background: "var(--bg-primary)",
    borderRadius: "var(--radius-md)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    border: "1px solid var(--gray-200)",
    zIndex: 1000,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: "var(--spacing-md)",
    cursor: "pointer",
    color: "var(--text-primary)",
    fontSize: "var(--font-size-sm)",
    transition: "all var(--transition-base)",
    borderBottom: "1px solid var(--gray-200)",
    background: "var(--bg-primary)",
    display: "block",
    textDecoration: "none",
  },
  dropdownItemLast: {
    borderBottom: "none",
  },
  dropdownItemHover: {
    background: "var(--gray-50)",
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
  },
  sidebarMobile: {
    transform: "translateX(-100%)",
    transition: "transform 0.3s ease-in-out",
    width: "280px",
    maxWidth: "85vw",
  },
  sidebarMobileOpen: {
    transform: "translateX(0)",
    boxShadow: "4px 0 20px rgba(0, 0, 0, 0.2)",
  },
};

export default function EmployeeSideNav({ onLogout, isMobile = false, isOpen = false, onClose }) {
  const location = useLocation();
  const { user, business } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isEmployee = user?.role === "EMPLOYEE";

  if (!isEmployee) return null;

  // Close menu when clicking a link on mobile
  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const mainNavItems = [
    { path: "/employee/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/employee/availability/submit", label: "Submit Availability", icon: "✏️" },
    { path: "/employee/schedule/my", label: "My Schedule", icon: "👤" },
  ];

  const settingsNavItems = [
    { path: "/employee/settings/profile", label: "Profile", icon: "👤" },
    { path: "/employee/settings/calendar", label: "Calendar", icon: "📆" },
    { path: "/employee/settings/security", label: "Security Center", icon: "🔒" },
    { path: "/employee/settings/support", label: "Support", icon: "💬" },
    { path: "/employee/settings/legal", label: "Legal", icon: "⚖️" },
  ];

  const isActive = (path) => {
    if (path === "/employee/dashboard") {
      return location.pathname === "/employee/dashboard" || location.pathname === "/dashboard";
    }
    if (path.startsWith("/employee/settings")) {
      // For settings, check exact match or if it's the specific settings page
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav style={{
      ...styles.sidebar,
      ...(isMobile ? styles.sidebarMobile : {}),
      ...(isMobile && isOpen ? styles.sidebarMobileOpen : {}),
    }}>
      <div style={styles.logo}>
        <div style={styles.logoText}>Schedrix</div>
      </div>

      <div style={styles.navSection}>
        {mainNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={handleLinkClick}
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
        <div style={styles.navSectionTitle}>SETTINGS</div>
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

      <div style={{ padding: "0 var(--spacing-lg)", marginBottom: "var(--spacing-md)", flexShrink: 0 }}>
        <button
          onClick={toggleTheme}
          style={styles.themeToggle}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--gray-200)";
          }}
        >
          <span>{theme === "dark" ? "🌙" : "☀️"}</span>
          <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
        </button>
      </div>

      <div 
        style={{
          ...styles.userSection,
          ...styles.userSectionClickable,
          position: "relative",
        }}
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--gray-100)";
        }}
        onMouseLeave={(e) => {
          if (!showProfileMenu) {
            e.currentTarget.style.background = "var(--bg-primary)";
          } else {
            e.currentTarget.style.background = "var(--bg-primary)";
          }
        }}
      >
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div style={styles.userDetails}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{user?.role?.toLowerCase()}</div>
          </div>
        </div>
        
        {showProfileMenu && (
          <div style={styles.dropdown}>
            <div
              style={{
                ...styles.dropdownItem,
                ...styles.dropdownItemLast,
                color: "var(--error)",
                fontWeight: 600,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileMenu(false);
                onLogout();
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--error-light)";
                e.currentTarget.style.color = "var(--error-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--bg-primary)";
                e.currentTarget.style.color = "var(--error)";
              }}
            >
              Logout
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
