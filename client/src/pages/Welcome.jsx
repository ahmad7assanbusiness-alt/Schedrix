import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../auth/useAuth.js";
import "../index.css";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "var(--spacing-xl)",
  },
  container: {
    width: "100%",
    maxWidth: "480px",
  },
  card: {
    background: "rgba(255, 255, 255, 0.98)",
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
    color: "var(--gray-500)",
    fontSize: "var(--font-size-lg)",
    fontWeight: 400,
  },
  tabs: {
    display: "flex",
    gap: "var(--spacing-sm)",
    marginBottom: "var(--spacing-xl)",
    background: "var(--gray-100)",
    padding: "var(--spacing-xs)",
    borderRadius: "var(--radius-lg)",
  },
  tab: {
    flex: 1,
    padding: "var(--spacing-md) var(--spacing-lg)",
    borderRadius: "var(--radius-md)",
    border: "none",
    background: "transparent",
    color: "var(--gray-600)",
    fontWeight: 600,
    fontSize: "var(--font-size-base)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
  },
  tabActive: {
    background: "white",
    color: "var(--primary)",
    boxShadow: "var(--shadow-sm)",
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
    background: "white",
    color: "var(--gray-900)",
    transition: "all var(--transition-base)",
    fontFamily: "var(--font-family)",
  },
  inputFocus: {
    outline: "none",
    borderColor: "var(--primary)",
    boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
  },
  label: {
    display: "block",
    fontWeight: 600,
    fontSize: "var(--font-size-sm)",
    color: "var(--gray-700)",
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
  buttonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    transform: "none",
  },
  error: {
    padding: "var(--spacing-md)",
    background: "var(--error-light)",
    color: "#991b1b",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--error)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 500,
  },
};

export default function Welcome() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState("owner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [employeeName, setEmployeeName] = useState("");

  async function handleBootstrap(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user, business } = await api.post("/auth/bootstrap-owner", {
        businessName,
        ownerName,
      });
      login(token, user, business);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user, business } = await api.post("/auth/join", {
        joinCode: joinCode.toUpperCase(),
        employeeName,
      });
      login(token, user, business);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.logo}>ScheduleManager</h1>
            <p style={styles.subtitle}>Enterprise workforce scheduling made simple</p>
          </div>

          <div style={styles.tabs}>
            <button
              onClick={() => setMode("owner")}
              style={{
                ...styles.tab,
                ...(mode === "owner" ? styles.tabActive : {}),
              }}
            >
              Create Business
            </button>
            <button
              onClick={() => setMode("employee")}
              style={{
                ...styles.tab,
                ...(mode === "employee" ? styles.tabActive : {}),
              }}
            >
              Join Business
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          {mode === "owner" ? (
            <form onSubmit={handleBootstrap} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="Enter your business name"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="Enter your name"
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
                {loading ? "Creating..." : "Create Business"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Join Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                  style={styles.input}
                  placeholder="Enter join code"
                  maxLength={6}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Employee Name</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="Enter your name"
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
                {loading ? "Joining..." : "Join Business"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
