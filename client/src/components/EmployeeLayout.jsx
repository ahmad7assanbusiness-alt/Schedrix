import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth.js";
import EmployeeSideNav from "./EmployeeSideNav.jsx";
import "../index.css";

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "var(--gray-50)",
    position: "relative",
  },
  mainContent: {
    marginLeft: "280px",
    flex: 1,
    padding: "var(--spacing-xl)",
    minHeight: "100vh",
    background: "var(--bg-secondary)",
    width: "calc(100% - 280px)",
    transition: "all var(--transition-base)",
  },
  mainContentMobile: {
    marginLeft: 0,
    width: "100%",
    padding: "var(--spacing-md)",
  },
  mobileMenuButton: {
    position: "fixed",
    top: "var(--spacing-md)",
    left: "var(--spacing-md)",
    zIndex: 1000,
    width: "44px",
    height: "44px",
    borderRadius: "var(--radius-md)",
    border: "2px solid var(--gray-200)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "var(--font-size-xl)",
    boxShadow: "var(--shadow-md)",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: 99,
    display: "none",
  },
  overlayVisible: {
    display: "block",
  },
};

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  function handleLogout() {
    logout();
    navigate("/welcome");
  }

  return (
    <div style={styles.layout}>
      {isMobile && (
        <>
          <button
            style={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
          <div
            style={{
              ...styles.overlay,
              ...(isMobileMenuOpen ? styles.overlayVisible : {}),
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </>
      )}
      <EmployeeSideNav 
        onLogout={handleLogout}
        isMobile={isMobile}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <main style={{
        ...styles.mainContent,
        ...(isMobile ? styles.mainContentMobile : {}),
      }}>
        <Outlet />
      </main>
    </div>
  );
}
