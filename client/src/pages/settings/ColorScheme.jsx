import { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth.js";
import { api } from "../../api/client.js";
import ColorPicker from "../../components/ColorPicker.jsx";
import "../../index.css";

const styles = {
  title: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-xl)",
  },
  subtitle: {
    fontSize: "var(--font-size-base)",
    color: "var(--text-secondary)",
    marginBottom: "var(--spacing-xl)",
  },
  button: {
    padding: "var(--spacing-md) var(--spacing-xl)",
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    border: "none",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
    color: "white",
    boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.39)",
    marginTop: "var(--spacing-xl)",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  successMessage: {
    padding: "var(--spacing-md)",
    background: "var(--success-light)",
    color: "var(--success-text)",
    borderRadius: "var(--radius-md)",
    marginTop: "var(--spacing-md)",
    fontWeight: 500,
  },
  errorMessage: {
    padding: "var(--spacing-md)",
    background: "var(--error-light)",
    color: "var(--error-text)",
    borderRadius: "var(--radius-md)",
    marginTop: "var(--spacing-md)",
    fontWeight: 500,
  },
};

export default function ColorScheme() {
  const { business } = useAuth();
  const [colorScheme, setColorScheme] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (business?.colorScheme) {
      setColorScheme(business.colorScheme);
    } else {
      // Default color scheme
      setColorScheme({
        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#ec4899",
        tabBackground: "#f3f4f6",
        iconColor: "#6366f1",
        
      });
    }
  }, [business]);

  async function handleSave() {
    setLoading(true);
    setMessage(null);

    try {
      const updatedBusiness = await api.put("/business/color-scheme", { colorScheme });
      setMessage({ type: "success", text: "Color scheme saved successfully! The changes will be applied immediately." });
      
      // Update business in localStorage
      if (updatedBusiness) {
        localStorage.setItem("business", JSON.stringify(updatedBusiness));
        // Trigger a page reload to apply the new colors
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to save color scheme" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 style={styles.title}>Edit Color Scheme</h2>
      <p style={styles.subtitle}>
        Customize your app's colors to match your brand. Changes will be applied immediately.
      </p>
      
      {colorScheme && (
        <ColorPicker
          colorScheme={colorScheme}
          onChange={setColorScheme}
        />
      )}

      <button
        onClick={handleSave}
        disabled={loading || !colorScheme}
        style={{
          ...styles.button,
          ...(loading || !colorScheme ? styles.buttonDisabled : {}),
        }}
      >
        {loading ? "Saving..." : "Save Color Scheme"}
      </button>

      {message && (
        <div style={message.type === "success" ? styles.successMessage : styles.errorMessage}>
          {message.text}
        </div>
      )}
    </div>
  );
}
