import { useState, useEffect } from "react";
import { api } from "../../api/client.js";
import "../../index.css";

const styles = {
  title: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-xl)",
  },
  description: {
    color: "var(--text-secondary)",
    marginBottom: "var(--spacing-xl)",
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "var(--spacing-lg)",
    marginBottom: "var(--spacing-xl)",
  },
  calendarCard: {
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-xl)",
    background: "var(--bg-primary)",
  },
  calendarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "var(--spacing-md)",
  },
  calendarInfo: {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-md)",
  },
  calendarIcon: {
    fontSize: "var(--font-size-3xl)",
  },
  calendarName: {
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  statusBadge: {
    padding: "var(--spacing-xs) var(--spacing-md)",
    borderRadius: "9999px",
    fontSize: "var(--font-size-xs)",
    fontWeight: 600,
  },
  statusConnected: {
    background: "var(--success-light)",
    color: "#065f46",
  },
  statusDisconnected: {
    background: "var(--gray-100)",
    color: "var(--gray-600)",
  },
  connectButton: {
    padding: "var(--spacing-sm) var(--spacing-md)",
    background: "var(--primary)",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    cursor: "pointer",
  },
  disconnectButton: {
    padding: "var(--spacing-sm) var(--spacing-md)",
    background: "var(--error-light)",
    color: "var(--error)",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    cursor: "pointer",
  },
};

const CALENDAR_PROVIDERS = [
  { id: "google", name: "Google Calendar", icon: "📅" },
  { id: "outlook", name: "Microsoft Outlook", icon: "📧" },
  { id: "icloud", name: "iCloud Calendar", icon: "☁️" },
];

export default function CalendarSettings() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
  }, []);

  async function loadIntegrations() {
    try {
      const data = await api.get("/auth/calendar-integrations");
      setIntegrations(data);
    } catch (err) {
      console.error("Failed to load integrations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(provider) {
    // In a real implementation, this would initiate OAuth flow
    // For now, we'll show a placeholder
    alert(`${provider} calendar integration will be implemented soon!`);
  }

  async function handleDisconnect(integrationId) {
    try {
      await api.delete(`/auth/calendar-integrations/${integrationId}`);
      loadIntegrations();
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  }

  function isConnected(providerId) {
    return integrations.some((i) => i.provider === providerId && i.enabled);
  }

  function getIntegration(providerId) {
    return integrations.find((i) => i.provider === providerId);
  }

  return (
    <div>
      <h2 style={styles.title}>Calendar Integration</h2>
      <p style={styles.description}>
        Connect your calendar accounts to sync schedules and events automatically.
      </p>

      <div style={styles.calendarGrid}>
        {CALENDAR_PROVIDERS.map((provider) => {
          const connected = isConnected(provider.id);
          const integration = getIntegration(provider.id);

          return (
            <div key={provider.id} style={styles.calendarCard}>
              <div style={styles.calendarHeader}>
                <div style={styles.calendarInfo}>
                  <span style={styles.calendarIcon}>{provider.icon}</span>
                  <div>
                    <div style={styles.calendarName}>{provider.name}</div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(connected
                          ? styles.statusConnected
                          : styles.statusDisconnected),
                      }}
                    >
                      {connected ? "Connected" : "Not Connected"}
                    </span>
                  </div>
                </div>
              </div>
              {connected ? (
                <button
                  onClick={() => handleDisconnect(integration.id)}
                  style={styles.disconnectButton}
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(provider.id)}
                  style={styles.connectButton}
                >
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
