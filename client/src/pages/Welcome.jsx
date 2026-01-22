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
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-md)",
    marginBottom: "var(--spacing-xl)",
  },
  optionButton: {
    width: "100%",
    padding: "1rem 1.5rem",
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    borderRadius: "var(--radius-md)",
    border: "2px solid var(--gray-200)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
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
  success: {
    padding: "var(--spacing-md)",
    background: "var(--success-light)",
    color: "var(--success-text)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--success)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 500,
    marginBottom: "var(--spacing-lg)",
  },
  linkText: {
    textAlign: "center",
    marginTop: "var(--spacing-lg)",
    color: "var(--text-secondary)",
    fontSize: "var(--font-size-sm)",
  },
  link: {
    color: "var(--primary)",
    textDecoration: "none",
    fontWeight: 600,
    cursor: "pointer",
  },
  googleButton: {
    width: "100%",
    padding: "0.875rem 1rem",
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    borderRadius: "var(--radius-md)",
    border: "2px solid var(--gray-200)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--spacing-sm)",
    marginBottom: "var(--spacing-md)",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    margin: "var(--spacing-lg) 0",
    color: "var(--text-secondary)",
    fontSize: "var(--font-size-sm)",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "var(--gray-200)",
  },
  dividerText: {
    padding: "0 var(--spacing-md)",
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
};

export default function Welcome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState("select"); // "select", "owner-register", "owner-login", "employee-register", "employee-login"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Check for OAuth errors in URL
  useEffect(() => {
    const oauthError = searchParams.get("error");
    const errorDetails = searchParams.get("details");
    if (oauthError) {
      let errorMessage = "An error occurred. Please try again.";
      
      if (oauthError === "oauth_failed") {
        if (errorDetails) {
          const decoded = decodeURIComponent(errorDetails);
          // Check for common error patterns
          if (decoded.includes("redirect_uri_mismatch")) {
            errorMessage = "Redirect URI mismatch. Please check your Google OAuth configuration. The redirect URI must match exactly what's configured in Google Cloud Console.";
          } else if (decoded.includes("invalid_client")) {
            errorMessage = "Invalid Google OAuth client. Please check your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.";
          } else if (decoded.includes("invalid_grant")) {
            errorMessage = "Invalid authorization code. Please try again.";
          } else if (decoded.includes("token_exchange_failed")) {
            errorMessage = "Failed to exchange authorization code for tokens. Please check your Google OAuth configuration.";
          } else if (decoded.includes("token_verification_failed")) {
            errorMessage = "Failed to verify Google ID token. Please check your Google OAuth configuration.";
          } else {
            errorMessage = `Google login failed: ${decoded}`;
          }
        } else {
          errorMessage = "Google login failed. Please check your Google OAuth configuration and try again.";
        }
      } else if (oauthError === "no_email") {
        errorMessage = "Google account does not have an email address.";
      } else if (oauthError === "invalid_join_code") {
        errorMessage = "Invalid join code. Please check and try again.";
      } else if (oauthError === "user_not_found") {
        errorMessage = "Account not found. Please register first.";
      } else if (oauthError === "no_token" || oauthError === "auth_failed") {
        errorMessage = errorDetails 
          ? `Authentication failed: ${decodeURIComponent(errorDetails)}`
          : "Authentication failed. Please try again.";
      }
      
      setError(errorMessage);
      // Clear the error from URL
      navigate("/welcome", { replace: true });
    }
  }, [searchParams, navigate]);

  // Owner registration form state
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Owner login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Employee registration form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");
  const [employeeConfirmPassword, setEmployeeConfirmPassword] = useState("");
  const [joinCode, setJoinCode] = useState("");

  // Employee login form state
  const [employeeLoginEmail, setEmployeeLoginEmail] = useState("");
  const [employeeLoginPassword, setEmployeeLoginPassword] = useState("");

  // Password validation function
  function validatePassword(password) {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  }

  async function handleOwnerRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    // Validate password requirements
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

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
      setConfirmPassword("");
      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        setMode("owner-login");
        setSuccess(null);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleOwnerLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user, business } = await api.post("/auth/login", {
        email: loginEmail,
        password: loginPassword,
        expectedRole: "OWNER",
      });
      login(token, user, business);
      navigate("/dashboard");
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.error === "ROLE_MISMATCH") {
        // Show popup alert
        alert(errorData.message);
        // Redirect to employee login
        setMode("employee-login");
        setEmployeeLoginEmail(loginEmail);
        setEmployeeLoginPassword("");
        setLoginEmail("");
        setLoginPassword("");
      } else {
        setError(errorData?.error || err.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleEmployeeRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate password match
    if (employeePassword !== employeeConfirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    // Validate password requirements
    const passwordError = validatePassword(employeePassword);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      // Combine firstName and lastName into name for database
      const employeeName = `${firstName} ${lastName}`.trim();
      
      await api.post("/auth/join", {
        joinCode: joinCode.toUpperCase(),
        employeeName,
        email: employeeEmail,
        password: employeePassword,
        phone: phone || undefined,
      });
      setSuccess("Registration successful! Please login.");
      // Clear form
      setFirstName("");
      setLastName("");
      setEmployeeEmail("");
      setPhone("");
      setEmployeePassword("");
      setEmployeeConfirmPassword("");
      setJoinCode("");
      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        setMode("employee-login");
        setSuccess(null);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmployeeLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user, business } = await api.post("/auth/login", {
        email: employeeLoginEmail,
        password: employeeLoginPassword,
        expectedRole: "EMPLOYEE",
      });
      login(token, user, business);
      navigate("/dashboard");
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.error === "ROLE_MISMATCH") {
        // Show popup alert
        alert(errorData.message);
        // Redirect to owner login
        setMode("owner-login");
        setLoginEmail(employeeLoginEmail);
        setLoginPassword("");
        setEmployeeLoginEmail("");
        setEmployeeLoginPassword("");
      } else {
        setError(errorData?.error || err.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(role) {
    try {
      setLoading(true);
      setError(null);
      
      // Get Google OAuth URL from backend
      const params = new URLSearchParams({ role });
      // For owner registration, we don't need businessName/ownerName upfront
      if (role === "EMPLOYEE" && mode === "employee-register") {
        params.append("joinCode", joinCode);
      }
      
      const { authUrl } = await api.get(`/auth/google?${params.toString()}`);
      
      if (!authUrl) {
        throw new Error("No authentication URL received from server");
      }
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (err) {
      console.error("Google login initiation error:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to initiate Google login";
      setError(errorMessage);
      setLoading(false);
    }
  }

  if (mode === "select") {
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
              <h1 style={styles.logo}>ScheduleManager</h1>
              <p style={styles.subtitle}>Enterprise workforce scheduling made simple</p>
            </div>

            <div style={styles.buttonGroup}>
              <button
                onClick={() => setMode("owner-register")}
                style={styles.optionButton}
              >
                Owner
              </button>
              <button
                onClick={() => setMode("employee-register")}
                style={styles.optionButton}
              >
                Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
            <h1 style={styles.logo}>ScheduleManager</h1>
            <p style={styles.subtitle}>
              {mode === "owner-register" || mode === "owner-login"
                ? "Business Owner"
                : "Employee"}
            </p>
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          {mode === "owner-register" && (
            <>
              <button
                onClick={() => handleGoogleLogin("OWNER")}
                disabled={loading}
                style={{
                  ...styles.googleButton,
                  ...(loading ? styles.buttonDisabled : {}),
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.background = "var(--gray-50)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = "var(--gray-200)";
                    e.currentTarget.style.background = "var(--bg-primary)";
                  }
                }}
              >
                <span>🔵</span>
                <span>Continue with Google</span>
              </button>
              
              <div style={styles.divider}>
                <div style={styles.dividerLine}></div>
                <span style={styles.dividerText}>OR</span>
                <div style={styles.dividerLine}></div>
              </div>

              <form onSubmit={handleOwnerRegister} style={styles.form}>
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
                    minLength={8}
                    style={styles.input}
                    placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
                  />
                  <small style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    Must be at least 8 characters with uppercase, lowercase, and a number
                  </small>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    style={styles.input}
                    placeholder="Confirm your password"
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
              <div style={styles.linkText}>
                Already have an account?{" "}
                <span
                  style={styles.link}
                  onClick={() => {
                    setMode("owner-login");
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  Click here to login
                </span>
              </div>
            </>
          )}

          {mode === "owner-login" && (
            <>
              <button
                onClick={() => handleGoogleLogin("OWNER")}
                disabled={loading}
                style={{
                  ...styles.googleButton,
                  ...(loading ? styles.buttonDisabled : {}),
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.background = "var(--gray-50)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = "var(--gray-200)";
                    e.currentTarget.style.background = "var(--bg-primary)";
                  }
                }}
              >
                <span>🔵</span>
                <span>Continue with Google</span>
              </button>
              
              <div style={styles.divider}>
                <div style={styles.dividerLine}></div>
                <span style={styles.dividerText}>OR</span>
                <div style={styles.dividerLine}></div>
              </div>

              <form onSubmit={handleOwnerLogin} style={styles.form}>
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
              <div style={styles.linkText}>
                Don't have an account?{" "}
                <span
                  style={styles.link}
                  onClick={() => {
                    setMode("owner-register");
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  Click here to register
                </span>
              </div>
            </>
          )}

          {mode === "employee-register" && (
            <>
              <button
                onClick={() => handleGoogleLogin("EMPLOYEE")}
                disabled={loading || !joinCode}
                style={{
                  ...styles.googleButton,
                  ...(loading || !joinCode ? styles.buttonDisabled : {}),
                }}
                onMouseEnter={(e) => {
                  if (!loading && joinCode) {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.background = "var(--gray-50)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && joinCode) {
                    e.currentTarget.style.borderColor = "var(--gray-200)";
                    e.currentTarget.style.background = "var(--bg-primary)";
                  }
                }}
                title={!joinCode ? "Please enter a join code first" : ""}
              >
                <span>🔵</span>
                <span>Continue with Google</span>
              </button>
              
              <div style={styles.divider}>
                <div style={styles.dividerLine}></div>
                <span style={styles.dividerText}>OR</span>
                <div style={styles.dividerLine}></div>
              </div>

              <form onSubmit={handleEmployeeRegister} style={styles.form}>
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
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="your@email.com"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={styles.input}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
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
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    value={employeePassword}
                    onChange={(e) => setEmployeePassword(e.target.value)}
                    required
                    minLength={8}
                    style={styles.input}
                    placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
                  />
                  <small style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    Must be at least 8 characters with uppercase, lowercase, and a number
                  </small>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <input
                    type="password"
                    value={employeeConfirmPassword}
                    onChange={(e) => setEmployeeConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    style={styles.input}
                    placeholder="Confirm your password"
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
              <div style={styles.linkText}>
                Already registered?{" "}
                <span
                  style={styles.link}
                  onClick={() => {
                    setMode("employee-login");
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  Click here to login
                </span>
              </div>
            </>
          )}

          {mode === "employee-login" && (
            <>
              <button
                onClick={() => handleGoogleLogin("EMPLOYEE")}
                disabled={loading}
                style={{
                  ...styles.googleButton,
                  ...(loading ? styles.buttonDisabled : {}),
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.background = "var(--gray-50)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = "var(--gray-200)";
                    e.currentTarget.style.background = "var(--bg-primary)";
                  }
                }}
              >
                <span>🔵</span>
                <span>Continue with Google</span>
              </button>
              
              <div style={styles.divider}>
                <div style={styles.dividerLine}></div>
                <span style={styles.dividerText}>OR</span>
                <div style={styles.dividerLine}></div>
              </div>

              <form onSubmit={handleEmployeeLogin} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={employeeLoginEmail}
                    onChange={(e) => setEmployeeLoginEmail(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="your@email.com"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    value={employeeLoginPassword}
                    onChange={(e) => setEmployeeLoginPassword(e.target.value)}
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
              <div style={styles.linkText}>
                Don't have an account?{" "}
                <span
                  style={styles.link}
                  onClick={() => {
                    setMode("employee-register");
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  Click here to register
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
