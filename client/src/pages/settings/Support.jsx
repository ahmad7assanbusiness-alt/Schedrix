import "../../index.css";

const styles = {
  title: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-xl)",
  },
  card: {
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-xl)",
    background: "var(--bg-primary)",
    marginBottom: "var(--spacing-lg)",
  },
  cardTitle: {
    fontSize: "var(--font-size-lg)",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-sm)",
  },
  cardDescription: {
    color: "var(--text-secondary)",
    marginBottom: "var(--spacing-md)",
  },
  link: {
    color: "var(--primary)",
    textDecoration: "none",
    fontWeight: 600,
  },
};

export default function Support() {
  return (
    <div>
      <h2 style={styles.title}>Support</h2>
      
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>📧 Email Support</h3>
        <p style={styles.cardDescription}>
          Get help via email at support@schedrix.com
        </p>
        <a href="mailto:support@schedrix.com" style={styles.link}>
          Contact Support →
        </a>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>📚 Documentation</h3>
        <p style={styles.cardDescription}>
          Check out our help center for guides and tutorials.
        </p>
        <a href="#" style={styles.link}>
          View Documentation →
        </a>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>💬 Live Chat</h3>
        <p style={styles.cardDescription}>
          Chat with our support team (Available 9 AM - 5 PM EST).
        </p>
        <a href="#" style={styles.link}>
          Start Chat →
        </a>
      </div>
    </div>
  );
}
