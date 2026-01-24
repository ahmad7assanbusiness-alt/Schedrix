import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import "../index.css";

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundAttachment: "fixed",
    padding: "var(--spacing-xl)",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "var(--spacing-xl)",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-sm)",
    color: "white",
    textDecoration: "none",
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    marginBottom: "var(--spacing-lg)",
    opacity: 0.9,
    transition: "opacity var(--transition-base)",
  },
  title: {
    fontSize: "var(--font-size-4xl)",
    fontWeight: 800,
    color: "white",
    marginBottom: "var(--spacing-sm)",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  card: {
    background: "var(--bg-primary)",
    backdropFilter: "blur(20px)",
    borderRadius: "var(--radius-2xl)",
    boxShadow: "var(--shadow-xl)",
    padding: "var(--spacing-2xl)",
    animation: "fadeIn 0.6s ease-out",
    border: "1px solid var(--gray-200)",
  },
};

export default function PageLayout({ title, children, showBack = true }) {
  const { user } = useAuth();
  
  // Determine correct dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return "/dashboard"; // Default fallback
    const isManager = user.role === "OWNER" || user.role === "MANAGER";
    return isManager ? "/dashboard" : "/employee/dashboard";
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          {showBack && (
            <Link to={getDashboardPath()} style={styles.backLink}>
              ← Back to Dashboard
            </Link>
          )}
          <h1 style={styles.title}>{title}</h1>
        </div>
        <div style={styles.card}>{children}</div>
      </div>
    </div>
  );
}

