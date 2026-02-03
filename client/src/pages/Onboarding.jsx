import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import { api } from "../api/client.js";
import ColorPicker from "../components/ColorPicker.jsx";
import "../index.css";

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundAttachment: "fixed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "var(--spacing-xl)",
  },
  container: {
    maxWidth: "800px",
    width: "100%",
  },
  card: {
    background: "var(--bg-primary)",
    backdropFilter: "blur(20px)",
    borderRadius: "var(--radius-2xl)",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    padding: "var(--spacing-2xl)",
    animation: "fadeIn 0.6s ease-out",
  },
  stepIndicator: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "var(--spacing-2xl)",
    position: "relative",
  },
  stepLine: {
    position: "absolute",
    top: "20px",
    left: 0,
    right: 0,
    height: "2px",
    background: "var(--gray-200)",
    zIndex: 0,
  },
  stepLineActive: {
    background: "var(--primary)",
  },
  step: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
    flex: 1,
  },
  stepCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "var(--gray-200)",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    marginBottom: "var(--spacing-sm)",
    transition: "all var(--transition-base)",
  },
  stepCircleActive: {
    background: "var(--primary)",
    color: "white",
  },
  stepCircleCompleted: {
    background: "var(--success)",
    color: "white",
  },
  stepLabel: {
    fontSize: "var(--font-size-xs)",
    color: "var(--text-secondary)",
    fontWeight: 600,
    textAlign: "center",
  },
  title: {
    fontSize: "var(--font-size-3xl)",
    fontWeight: 800,
    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "var(--spacing-sm)",
    textAlign: "center",
  },
  subtitle: {
    color: "var(--text-secondary)",
    fontSize: "var(--font-size-lg)",
    textAlign: "center",
    marginBottom: "var(--spacing-2xl)",
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "var(--spacing-lg)",
    marginBottom: "var(--spacing-xl)",
  },
  calendarCard: {
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-xl)",
    textAlign: "center",
    cursor: "pointer",
    transition: "all var(--transition-base)",
    background: "var(--bg-primary)",
  },
  calendarCardSelected: {
    borderColor: "var(--primary)",
    background: "var(--primary-light)",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
  },
  calendarIcon: {
    fontSize: "var(--font-size-4xl)",
    marginBottom: "var(--spacing-md)",
  },
  calendarName: {
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-xs)",
  },
  calendarDesc: {
    fontSize: "var(--font-size-sm)",
    color: "var(--text-secondary)",
  },
  buttonGroup: {
    display: "flex",
    gap: "var(--spacing-md)",
    justifyContent: "flex-end",
    marginTop: "var(--spacing-xl)",
  },
  button: {
    padding: "var(--spacing-md) var(--spacing-xl)",
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    border: "none",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
  },
  buttonPrimary: {
    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
    color: "white",
    boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.39)",
  },
  buttonSecondary: {
    background: "var(--bg-primary)",
    color: "var(--text-secondary)",
    border: "2px solid var(--gray-300)",
  },
  skipButton: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "none",
    cursor: "pointer",
    fontSize: "var(--font-size-sm)",
    textDecoration: "underline",
  },
};

const CALENDAR_PROVIDERS = [
  {
    id: "google",
    name: "Google Calendar",
    icon: "📅",
    description: "Sync with your Google Calendar",
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    icon: "📧",
    description: "Connect your Outlook calendar",
  },
  {
    id: "icloud",
    name: "iCloud Calendar",
    icon: "☁️",
    description: "Link your iCloud calendar",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  const [colorScheme, setColorScheme] = useState(null);
  const [loading, setLoading] = useState(false);

  const totalSteps = 3;

  function toggleCalendar(calendarId) {
    setSelectedCalendars((prev) =>
      prev.includes(calendarId)
        ? prev.filter((id) => id !== calendarId)
        : [...prev, calendarId]
    );
  }

  async function handleComplete() {
    setLoading(true);
    try {
      // Save selected calendar integrations and color scheme
      // In the future, this would trigger OAuth flows for each selected calendar
      await api.post("/auth/complete-onboarding", {
        calendarIntegrations: selectedCalendars,
        colorScheme: colorScheme,
      });
      
      // Reload user data to get updated onboardingCompleted status
      // This ensures the OnboardingCheck component recognizes the change
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      // Still navigate to dashboard even if saving fails
      window.location.href = "/dashboard";
    } finally {
      setLoading(false);
    }
  }

  async function handleSkip() {
    setLoading(true);
    try {
      // Mark onboarding as complete without calendar integrations
      await api.post("/auth/complete-onboarding", {
        calendarIntegrations: [],
        colorScheme: colorScheme || null,
      });
      
      // Reload user data to get updated onboardingCompleted status
      // This ensures the OnboardingCheck component recognizes the change
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Failed to skip onboarding:", err);
      // Still navigate to dashboard even if saving fails
      window.location.href = "/dashboard";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.stepIndicator}>
            <div
              style={{
                ...styles.stepLine,
                width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                ...(currentStep > 1 ? styles.stepLineActive : {}),
              }}
            />
            {[1, 2, 3].map((step) => (
              <div key={step} style={styles.step}>
                <div
                  style={{
                    ...styles.stepCircle,
                    ...(step < currentStep
                      ? styles.stepCircleCompleted
                      : step === currentStep
                      ? styles.stepCircleActive
                      : {}),
                  }}
                >
                  {step < currentStep ? "✓" : step}
                </div>
                <div style={styles.stepLabel}>
                  {step === 1 ? "Welcome" : step === 2 ? "Colors" : "Connect Calendar"}
                </div>
              </div>
            ))}
          </div>

          {currentStep === 1 && (
            <div>
              <h1 style={styles.title}>Welcome to Opticore, {user?.name}! 👋</h1>
              <p style={styles.subtitle}>
                Let's get you set up. This will only take a minute.
              </p>
              <div style={styles.buttonGroup}>
                <button
                  onClick={handleSkip}
                  disabled={loading}
                  style={styles.skipButton}
                >
                  {loading ? "Skipping..." : "Skip onboarding"}
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                >
                  Get Started
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 style={styles.title}>Customize Your Colors</h2>
              <p style={styles.subtitle}>
                Choose a color scheme that matches your brand (you can change this later)
              </p>
              <ColorPicker
                colorScheme={colorScheme}
                onChange={setColorScheme}
              />
              <div style={styles.buttonGroup}>
                <button
                  onClick={() => setCurrentStep(1)}
                  style={{ ...styles.button, ...styles.buttonSecondary }}
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 style={styles.title}>Connect Your Calendar</h2>
              <p style={styles.subtitle}>
                Sync your schedules with your favorite calendar app (optional)
              </p>
              <div style={styles.calendarGrid}>
                {CALENDAR_PROVIDERS.map((calendar) => (
                  <div
                    key={calendar.id}
                    onClick={() => toggleCalendar(calendar.id)}
                    style={{
                      ...styles.calendarCard,
                      ...(selectedCalendars.includes(calendar.id)
                        ? styles.calendarCardSelected
                        : {}),
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedCalendars.includes(calendar.id)) {
                        e.currentTarget.style.borderColor = "var(--gray-300)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedCalendars.includes(calendar.id)) {
                        e.currentTarget.style.borderColor = "var(--gray-200)";
                      }
                    }}
                  >
                    <div style={styles.calendarIcon}>{calendar.icon}</div>
                    <div style={styles.calendarName}>{calendar.name}</div>
                    <div style={styles.calendarDesc}>{calendar.description}</div>
                  </div>
                ))}
              </div>
              <div style={styles.buttonGroup}>
                <button
                  onClick={() => setCurrentStep(2)}
                  style={{ ...styles.button, ...styles.buttonSecondary }}
                >
                  Back
                </button>
                <button
                  onClick={handleSkip}
                  disabled={loading}
                  style={styles.skipButton}
                >
                  {loading ? "Skipping..." : "Skip"}
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                >
                  {loading ? "Completing..." : "Complete Setup"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
