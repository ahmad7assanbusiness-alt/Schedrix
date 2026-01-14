import { Link, useNavigate } from "react-router-dom";
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
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    borderRadius: "var(--radius-2xl)",
    boxShadow: "var(--shadow-xl)",
    padding: "var(--spacing-xl)",
    marginBottom: "var(--spacing-xl)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    animation: "fadeIn 0.6s ease-out",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: "var(--font-size-4xl)",
    fontWeight: 800,
    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "var(--spacing-sm)",
  },
  subtitle: {
    color: "var(--gray-600)",
    fontSize: "var(--font-size-lg)",
    marginBottom: "var(--spacing-xs)",
  },
  badge: {
    display: "inline-block",
    padding: "0.375rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "var(--font-size-xs)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginTop: "var(--spacing-sm)",
  },
  badgeOwner: {
    background: "linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)",
    color: "white",
  },
  badgeEmployee: {
    background: "linear-gradient(135deg, var(--secondary) 0%, #7c3aed 100%)",
    color: "white",
  },
  joinCode: {
    background: "var(--gray-100)",
    padding: "var(--spacing-sm) var(--spacing-md)",
    borderRadius: "var(--radius-md)",
    fontFamily: "monospace",
    fontSize: "var(--font-size-lg)",
    fontWeight: 700,
    color: "var(--primary)",
    marginTop: "var(--spacing-sm)",
  },
  logoutBtn: {
    padding: "var(--spacing-md) var(--spacing-xl)",
    background: "linear-gradient(135deg, var(--error) 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 14px 0 rgba(239, 68, 68, 0.39)",
    transition: "all var(--transition-base)",
  },
  section: {
    marginBottom: "var(--spacing-xl)",
  },
  sectionTitle: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 700,
    color: "white",
    marginBottom: "var(--spacing-lg)",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "var(--spacing-lg)",
  },
  card: {
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    borderRadius: "var(--radius-xl)",
    padding: "var(--spacing-xl)",
    boxShadow: "var(--shadow-lg)",
    textDecoration: "none",
    color: "var(--gray-900)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-md)",
    transition: "all var(--transition-base)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    animation: "fadeIn 0.6s ease-out",
  },
  cardHover: {
    transform: "translateY(-4px)",
    boxShadow: "var(--shadow-xl)",
  },
  cardIcon: {
    fontSize: "var(--font-size-4xl)",
    marginBottom: "var(--spacing-sm)",
  },
  cardTitle: {
    fontSize: "var(--font-size-xl)",
    fontWeight: 700,
    color: "var(--gray-900)",
    marginBottom: "var(--spacing-xs)",
  },
  cardDescription: {
    color: "var(--gray-600)",
    fontSize: "var(--font-size-base)",
    lineHeight: 1.6,
  },
  arrow: {
    marginTop: "auto",
    color: "var(--primary)",
    fontWeight: 600,
    fontSize: "var(--font-size-sm)",
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-xs)",
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, business, logout } = useAuth();

  if (!user) {
    return (
      <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "white", fontSize: "var(--font-size-xl)" }}>Loading...</div>
      </div>
    );
  }

  const isManager = user.role === "OWNER" || user.role === "MANAGER";
  const isEmployee = user.role === "EMPLOYEE";

  const managerCards = [
    {
      to: "/availability/request",
      icon: "📅",
      title: "Availability Requests",
      description: "Create and manage availability requests for your team",
    },
    {
      to: "/schedule",
      icon: "📊",
      title: "Schedule Builder",
      description: "Build and publish schedules for your team",
    },
  ];

  const employeeCards = [
    {
      to: "/availability/submit",
      icon: "✏️",
      title: "Submit Availability",
      description: "Let your manager know when you're available",
    },
    {
      to: "/schedule/my",
      icon: "👤",
      title: "My Schedule",
      description: "View your personal schedule",
    },
    {
      to: "/schedule/full",
      icon: "👥",
      title: "Full Schedule",
      description: "View the complete team schedule",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.subtitle}>Welcome back, {user.name}</p>
            {business && (
              <>
                <p style={styles.subtitle}>{business.name}</p>
                {isManager && (
                  <div>
                    <div style={{ fontSize: "var(--font-size-sm)", color: "var(--gray-500)", marginBottom: "var(--spacing-xs)" }}>
                      Join Code:
                    </div>
                    <div style={styles.joinCode}>{business.joinCode}</div>
                  </div>
                )}
              </>
            )}
            <span
              style={{
                ...styles.badge,
                ...(isManager ? styles.badgeOwner : styles.badgeEmployee),
              }}
            >
              {user.role}
            </span>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/welcome");
            }}
            style={styles.logoutBtn}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 14px 0 rgba(239, 68, 68, 0.39)";
            }}
          >
            Logout
          </button>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            {isManager ? "Manager Tools" : "Employee Tools"}
          </h2>
          <div style={styles.grid}>
            {(isManager ? managerCards : employeeCards).map((card, index) => (
              <Link
                key={card.to}
                to={card.to}
                style={{
                  ...styles.card,
                  animationDelay: `${index * 0.1}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-xl)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                }}
              >
                <div style={styles.cardIcon}>{card.icon}</div>
                <h3 style={styles.cardTitle}>{card.title}</h3>
                <p style={styles.cardDescription}>{card.description}</p>
                <div style={styles.arrow}>
                  Get started →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
