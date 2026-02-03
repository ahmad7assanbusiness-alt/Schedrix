import { useState } from "react";
import { api } from "../../api/client.js";
import { useAuth } from "../../auth/useAuth.js";
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
    color: "var(--success-text)",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--spacing-lg)",
  },
};

export default function Security() {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [verificationStep, setVerificationStep] = useState("request"); // "request", "verify", "change"
  const [verificationCode, setVerificationCode] = useState("");

  // Check if user logged in with Google (no password)
  const isGoogleUser = !user?.hasPassword;

  async function handleRequestVerification() {
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/request-password-verification");
      setVerificationStep("verify");
      setSuccess("Verification code sent to your email. Please check your inbox.");
    } catch (err) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/verify-password-code", { code: verificationCode });
      setVerificationStep("change");
      setSuccess("Email verified! You can now change your password.");
      setVerificationCode("");
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  }

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
        verificationCode,
        newPassword,
      });
      setSuccess("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setVerificationCode("");
      setVerificationStep("request");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  // Hide password change for Google users
  if (isGoogleUser) {
    return (
      <div>
        <h2 style={styles.title}>Security Center</h2>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Change Password</h3>
          <p style={{ color: "var(--text-secondary)" }}>
            You logged in with Google. To change your password, please use your Google account settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={styles.title}>Security Center</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Change Password</h3>
        {success && <div style={styles.success}>{success}</div>}
        {error && <div style={{ ...styles.success, background: "var(--error-light)", color: "var(--error-text)" }}>{error}</div>}
        
        {verificationStep === "request" && (
          <div>
            <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-lg)" }}>
              To change your password, we need to verify your email address first.
            </p>
            <button onClick={handleRequestVerification} disabled={loading} style={styles.button}>
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </div>
        )}

        {verificationStep === "verify" && (
          <form onSubmit={(e) => { e.preventDefault(); handleVerifyCode(); }} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter code from email"
                required
                maxLength={6}
                style={styles.input}
              />
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginTop: "var(--spacing-xs)" }}>
                Check your email for the verification code
              </p>
            </div>
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <button
              type="button"
              onClick={() => {
                setVerificationStep("request");
                setVerificationCode("");
                setSuccess(null);
                setError(null);
              }}
              style={{ ...styles.button, background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--gray-300)", marginTop: "var(--spacing-sm)" }}
            >
              Back
            </button>
          </form>
        )}

        {verificationStep === "change" && (
          <form onSubmit={handleChangePassword} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                style={styles.input}
              />
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginTop: "var(--spacing-xs)" }}>
                Password must be at least 8 characters with uppercase, lowercase, and number
              </p>
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
            <button
              type="button"
              onClick={() => {
                setVerificationStep("request");
                setNewPassword("");
                setConfirmPassword("");
                setSuccess(null);
                setError(null);
              }}
              style={{ ...styles.button, background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--gray-300)", marginTop: "var(--spacing-sm)" }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
