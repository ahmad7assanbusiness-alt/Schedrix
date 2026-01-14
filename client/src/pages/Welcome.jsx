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
    maxWidth: "600px",
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
  loadingText: {
    textAlign: "center",
    color: "var(--gray-500)",
    padding: "var(--spacing-xl)",
  },
};

export default function Welcome() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [checkingOwners, setCheckingOwners] = useState(true);
  const [hasOwners, setHasOwners] = useState(false);
  const [mode, setMode] = useState("login"); // "login", "register", or "employee"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Registration form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");

  // Login form state
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Employee join state
  const [joinCode, setJoinCode] = useState("");
  const [employeeName, setEmployeeName] = useState("");

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
      // Default to register if check fails
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

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const { token, user, business } = await api.post("/auth/register", {
        email,
        password,
        confirmPassword,
        phone,
        firstName,
        lastName,
        businessName,
        businessAddress,
      });
      login(token, user, business);
      navigate("/dashboard");
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
        emailOrPhone,
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
      setError(err.message || "Invalid join code");
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

          {hasOwners && (
            <div style={styles.tabs}>
              <button
                onClick={() => setMode("login")}
                style={{
                  ...styles.tab,
                  ...(mode === "login" ? styles.tabActive : {}),
                }}
              >
                Login
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
          )}

          {error && <div style={styles.error}>{error}</div>}

          {mode === "register" && (
            <form onSubmit={handleRegister} style={styles.form}>
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
              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="Confirm your password"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="John"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="Doe"
                />
              </div>
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
                <label style={styles.label}>Business Address</label>
                <input
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="123 Main St, City, State 12345"
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
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email or Phone</label>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="your@email.com or +1 (555) 123-4567"
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
          )}

          {mode === "employee" && (
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
