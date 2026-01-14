import { useState, useEffect } from "react";
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
    boxSizing: "border-box",
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
    marginBottom: "var(--spacing-lg)",
  },
  success: {
    padding: "var(--spacing-md)",
    background: "var(--success-light)",
    color: "#065f46",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--success)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 500,
    marginBottom: "var(--spacing-lg)",
  },
  loadingText: {
    textAlign: "center",
    color: "var(--gray-500)",
    padding: "var(--spacing-xl)",
  },
  link: {
    color: "var(--primary)",
    textDecoration: "none",
    fontWeight: 600,
    cursor: "pointer",
  },
  linkText: {
    textAlign: "center",
    marginTop: "var(--spacing-lg)",
    color: "var(--gray-600)",
    fontSize: "var(--font-size-sm)",
  },
};

export default function Welcome() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [checkingOwners, setCheckingOwners] = useState(true);
  const [hasOwners, setHasOwners] = useState(false);
  const [mode, setMode] = useState("register"); // "login" or "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Registration form state
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    checkOwners();
  }, []);

  async function checkOwners() {
    try {
      const response = await api.get("/auth/check-owners");
      setHasOwners(response.hasOwners);
      setMode(response.hasOwners ? "login" : "register");
    } catch (err) {
      console.error("Error checking owners:", err);
      setHasOwners(false);
      setMode("register");
    } finally {
      setCheckingOwners(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/auth/register", {
        businessName,
        ownerName,
        email,
        password,
      });
      setSuccess("Registration successful! Please login.");
      // Clear form
      setBusinessName("");
      setOwnerName("");
      setEmail("");
      setPassword("");
      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        setMode("login");
        setSuccess(null);
      }, 1500);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user, business } = await api.post("/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });
      login(token, user, business);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  if (checkingOwners) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.loadingText}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.logo}>ScheduleManager</h1>
            <p style={styles.subtitle}>Enterprise workforce scheduling made simple</p>
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          {mode === "register" && (
            <>
              <form onSubmit={handleRegister} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="My Business Inc."
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
                    placeholder="John Doe"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="your@email.com"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={styles.input}
                    placeholder="Minimum 6 characters"
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
                  {loading ? "Registering..." : "Register"}
                </button>
              </form>
            </>
          )}

          {mode === "login" && (
            <>
              <form onSubmit={handleLogin} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="your@email.com"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="Enter your password"
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
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
