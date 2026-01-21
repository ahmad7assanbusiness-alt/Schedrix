import { useState } from "react";
import { api } from "../../api/client.js";
import "../../index.css";

const styles = {
  title: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-xl)",
  },
  section: {
    marginBottom: "var(--spacing-2xl)",
  },
  sectionTitle: {
    fontSize: "var(--font-size-xl)",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-md)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-lg)",
    maxWidth: "500px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-sm)",
  },
  label: {
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  input: {
    padding: "var(--spacing-md)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
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
    alignSelf: "flex-start",
  },
  success: {
    padding: "var(--spacing-md)",
    background: "var(--success-light)",
    color: "#065f46",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--spacing-lg)",
  },
};

export default function Security() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  async function handleChangePassword(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      setLoading(false);
      return;
    }

    try {
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 style={styles.title}>Security Center</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Change Password</h3>
        {success && <div style={styles.success}>{success}</div>}
        {error && <div style={{ ...styles.success, background: "var(--error-light)", color: "#991b1b" }}>{error}</div>}
        <form onSubmit={handleChangePassword} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
