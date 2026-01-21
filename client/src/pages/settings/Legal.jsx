import "../../index.css";

const styles = {
  title: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-xl)",
  },
  linkList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-md)",
  },
  link: {
    padding: "var(--spacing-md)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)",
    textDecoration: "none",
    transition: "all var(--transition-base)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "var(--bg-primary)",
  },
  linkText: {
    fontWeight: 500,
  },
  arrow: {
    color: "var(--gray-400)",
  },
};

export default function Legal() {
  const legalLinks = [
    { label: "Terms of Service", url: "#" },
    { label: "Privacy Policy", url: "#" },
    { label: "Cookie Policy", url: "#" },
    { label: "Data Processing Agreement", url: "#" },
    { label: "Acceptable Use Policy", url: "#" },
  ];

  return (
    <div>
      <h2 style={styles.title}>Legal</h2>
      <div style={styles.linkList}>
        {legalLinks.map((link) => (
          <a
            key={link.label}
            href={link.url}
            style={styles.link}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.color = "var(--primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--gray-200)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <span style={styles.linkText}>{link.label}</span>
            <span style={styles.arrow}>→</span>
          </a>
        ))}
      </div>
    </div>
  );
}
