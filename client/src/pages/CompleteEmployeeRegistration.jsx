import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../auth/useAuth.js";
import { useTheme } from "../contexts/ThemeContext.jsx";
import "../index.css";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "var(--spacing-xl)",
    position: "relative",
  },
  container: {
    width: "100%",
    maxWidth: "480px",
  },
  card: {
    background: "var(--bg-primary)",
    backdropFilter: "blur(20px)",
    borderRadius: "var(--radius-2xl)",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    padding: "var(--spacing-2xl)",
    animation: "fadeIn 0.6s ease-out",
  },
  header: {
    textAlign: "center",
    marginBottom: "var(--spacing-2xl)",
  },
  logo: {
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
    fontWeight: 400,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-lg)",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-sm)",
  },
  input: {
    width: "100%",
    padding: "0.875rem 1rem",
    fontSize: "var(--font-size-base)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-md)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    transition: "all var(--transition-base)",
    fontFamily: "var(--font-family)",
    boxSizing: "border-box",
  },
  label: {
    display: "block",
    fontWeight: 600,
    fontSize: "var(--font-size-sm)",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  button: {
    width: "100%",
    padding: "1rem",
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    borderRadius: "var(--radius-md)",
    border: "none",
    cursor: "pointer",
    transition: "all var(--transition-base)",
    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
    color: "white",
    boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.39)",
    marginTop: "var(--spacing-md)",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    transform: "none",
  },
  error: {
    padding: "var(--spacing-md)",
    background: "var(--error-light)",
    color: "var(--error-text)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--error)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 500,
    marginBottom: "var(--spacing-lg)",
  },
  themeToggle: {
    position: "absolute",
    top: "var(--spacing-lg)",
    right: "var(--spacing-lg)",
    padding: "var(--spacing-sm) var(--spacing-md)",
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
    zIndex: 10,
  },
  googleInfo: {
    padding: "var(--spacing-md)",
    background: "var(--gray-50)",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--spacing-lg)",
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-md)",
  },
  googleIcon: {
    fontSize: "var(--font-size-2xl)",
  },
  googleText: {
    color: "var(--text-secondary)",
    fontSize: "var(--font-size-sm)",
  },
};

export default function CompleteEmployeeRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [googleEmail, setGoogleEmail] = useState(null);

  const [fullName, setFullName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const tempToken = searchParams.get("token");
    if (!tempToken) {
      navigate("/welcome?error=invalid_token");
      return;
    }

    // Decode token to get email (client-side decode, not verification)
    try {
      const payload = JSON.parse(atob(tempToken.split(".")[1]));
      if (payload.googleEmail) {
        setGoogleEmail(payload.googleEmail);
      }
    } catch (e) {
      console.error("Failed to decode token:", e);
    }
  }, [searchParams, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!fullName || fullName.trim().length === 0) {
      setError("Full name is required");
      setLoading(false);
      return;
    }

    if (!joinCode || joinCode.trim().length === 0) {
      setError("Join code is required");
      setLoading(false);
      return;
    }

    const tempToken = searchParams.get("token");
    if (!tempToken) {
      setError("Invalid registration token. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const { token, user, business } = await api.post("/auth/google/complete-employee", {
        tempToken,
        fullName: fullName.trim(),
        joinCode: joinCode.trim().toUpperCase(),
        phone: phone.trim() || null,
      });

      login(token, user, business);
      navigate("/employee/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <button
        onClick={toggleTheme}
        style={styles.themeToggle}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--primary)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--gray-200)";
          e.currentTarget.style.transform = "scale(1)";
        }}
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        <span>{theme === "dark" ? "☀️" : "🌙"}</span>
        <span>{theme === "dark" ? "Light" : "Dark"}</span>
      </button>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.logo}>Complete Registration</h1>
            <p style={styles.subtitle}>Finish setting up your employee account</p>
          </div>

          {googleEmail && (
            <div style={styles.googleInfo}>
              <span style={styles.googleIcon}>🔵</span>
              <span style={styles.googleText}>Signed in as {googleEmail}</span>
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={styles.input}
                placeholder="John Doe"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Join Code *</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                required
                style={styles.input}
                placeholder="ABC123"
                maxLength={10}
              />
              <small style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                Enter the join code provided by your employer
              </small>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={styles.input}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
              }}
            >
              {loading ? "Completing Registration..." : "Complete Registration"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
