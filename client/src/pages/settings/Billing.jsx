import "../../index.css";

const styles = {
  title: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 700,
    color: "var(--gray-900)",
    marginBottom: "var(--spacing-xl)",
  },
  card: {
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-xl)",
    background: "white",
    maxWidth: "600px",
  },
  planName: {
    fontSize: "var(--font-size-xl)",
    fontWeight: 700,
    color: "var(--gray-900)",
    marginBottom: "var(--spacing-sm)",
  },
  planPrice: {
    fontSize: "var(--font-size-3xl)",
    fontWeight: 800,
    color: "var(--primary)",
    marginBottom: "var(--spacing-lg)",
  },
  button: {
    padding: "var(--spacing-md) var(--spacing-xl)",
    background: "var(--primary)",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default function Billing() {
  return (
    <div>
      <h2 style={styles.title}>Billing</h2>
      <div style={styles.card}>
        <div style={styles.planName}>Free Plan</div>
        <div style={styles.planPrice}>$0<span style={{ fontSize: "var(--font-size-base)", fontWeight: 400 }}>/month</span></div>
        <p style={{ color: "var(--gray-600)", marginBottom: "var(--spacing-xl)" }}>
          You're currently on the free plan. Upgrade to unlock advanced features.
        </p>
        <button style={styles.button}>Upgrade Plan (Coming Soon)</button>
      </div>
    </div>
  );
}
