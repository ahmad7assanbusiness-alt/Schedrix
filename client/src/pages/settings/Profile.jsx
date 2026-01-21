import { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth.js";
import { api } from "../../api/client.js";
import "../../index.css";

const styles = {
  title: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 700,
    color: "var(--gray-900)",
    marginBottom: "var(--spacing-xl)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-xl)",
    maxWidth: "600px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-sm)",
  },
  label: {
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    color: "var(--gray-700)",
  },
  input: {
    padding: "var(--spacing-md)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
    transition: "all var(--transition-base)",
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

export default function Profile() {
  const { user, reload } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    try {
      await api.put("/auth/profile", { name, email });
      await reload();
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 style={styles.title}>Profile</h2>
      {success && <div style={styles.success}>{success}</div>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
