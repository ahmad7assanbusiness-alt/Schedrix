import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import "../index.css";

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    background: "var(--bg-primary)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-sm)",
    padding: "var(--spacing-xl)",
    marginBottom: "var(--spacing-xl)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
    color: "var(--text-secondary)",
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
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-lg)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "var(--spacing-lg)",
  },
  card: {
    background: "var(--bg-primary)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-xl)",
    boxShadow: "var(--shadow-sm)",
    border: "2px solid var(--gray-200)",
    textDecoration: "none",
    color: "var(--text-primary)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-md)",
    transition: "all var(--transition-base)",
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
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-xs)",
  },
  cardDescription: {
    color: "var(--text-secondary)",
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
  const { user, business } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
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
    {
      to: "/employees",
      icon: "👥",
      title: "Employees",
      description: "Manage your team members",
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
      description: "View your personal schedule or the full team schedule",
    },
  ];

  return (
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
                    <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: "var(--spacing-xs)" }}>
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
  );
}
