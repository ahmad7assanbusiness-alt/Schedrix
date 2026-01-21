import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import "../index.css";

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundAttachment: "fixed",
    padding: "var(--spacing-xl)",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    background: "var(--bg-primary)",
    backdropFilter: "blur(20px)",
    borderRadius: "var(--radius-2xl)",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    padding: "var(--spacing-2xl)",
    animation: "fadeIn 0.6s ease-out",
    marginBottom: "var(--spacing-xl)",
  },
  header: {
    marginBottom: "var(--spacing-2xl)",
    borderBottom: "2px solid var(--gray-200)",
    paddingBottom: "var(--spacing-lg)",
  },
  title: {
    fontSize: "var(--font-size-3xl)",
    fontWeight: 800,
    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "var(--spacing-sm)",
  },
  subtitle: {
    color: "var(--text-secondary)",
    fontSize: "var(--font-size-lg)",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-sm)",
    color: "var(--primary)",
    textDecoration: "none",
    fontWeight: 600,
    marginBottom: "var(--spacing-lg)",
    transition: "all var(--transition-base)",
    "&:hover": {
      color: "var(--primary-dark)",
      transform: "translateX(-4px)",
    },
  },
  error: {
    padding: "var(--spacing-md)",
    backgroundColor: "var(--error-light)",
    color: "var(--error-text)",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--spacing-lg)",
    border: "1px solid var(--error)",
  },
  success: {
    padding: "var(--spacing-md)",
    backgroundColor: "var(--success-light)",
    color: "var(--success-text)",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--spacing-lg)",
    border: "1px solid var(--success)",
  },
  select: {
    padding: "var(--spacing-md)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
    fontFamily: "var(--font-family)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    transition: "all var(--transition-base)",
    cursor: "pointer",
    "&:focus": {
      outline: "none",
      borderColor: "var(--primary)",
      boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
    },
  },
  formCard: {
    background: "var(--bg-secondary)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-xl)",
    marginBottom: "var(--spacing-2xl)",
  },
  formTitle: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-lg)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "var(--spacing-lg)",
    marginBottom: "var(--spacing-lg)",
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
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  input: {
    padding: "var(--spacing-md)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
    fontFamily: "var(--font-family)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    transition: "all var(--transition-base)",
    "&:focus": {
      outline: "none",
      borderColor: "var(--primary)",
      boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
    },
  },
  submitButton: {
    padding: "var(--spacing-md) var(--spacing-xl)",
    fontSize: "var(--font-size-lg)",
    fontWeight: 700,
    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
    boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.39)",
    "&:hover:not(:disabled)": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
      transform: "none",
    },
  },
  requestsTitle: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-lg)",
  },
  requestsList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-md)",
  },
  requestCard: {
    background: "var(--bg-primary)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-lg)",
    transition: "all var(--transition-base)",
    "&:hover": {
      borderColor: "var(--primary)",
      boxShadow: "var(--shadow-md)",
    },
  },
  requestHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "var(--spacing-md)",
  },
  requestDates: {
    fontSize: "var(--font-size-lg)",
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  requestStatus: {
    display: "inline-flex",
    alignItems: "center",
    padding: "var(--spacing-xs) var(--spacing-md)",
    borderRadius: "9999px",
    fontSize: "var(--font-size-xs)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  statusOpen: {
    background: "var(--success-light)",
    color: "var(--success-text)",
  },
  statusClosed: {
    background: "var(--gray-100)",
    color: "var(--text-secondary)",
  },
  viewButton: {
    padding: "var(--spacing-sm) var(--spacing-md)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    background: "var(--primary)",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
    "&:hover": {
      background: "var(--primary-dark)",
      transform: "translateY(-1px)",
    },
  },
  entriesTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "var(--spacing-lg)",
    background: "var(--bg-primary)",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
  },
  tableHeader: {
    background: "var(--gray-100)",
  },
  tableHeaderCell: {
    padding: "var(--spacing-md)",
    textAlign: "left",
    fontWeight: 600,
    color: "var(--text-secondary)",
    fontSize: "var(--font-size-sm)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid var(--gray-200)",
  },
  tableCell: {
    padding: "var(--spacing-md)",
    borderBottom: "1px solid var(--gray-200)",
    color: "var(--text-primary)",
  },
  tableRow: {
    transition: "background-color var(--transition-base)",
    "&:hover": {
      background: "var(--gray-50)",
    },
  },
  checkIcon: {
    color: "var(--success)",
    fontWeight: "bold",
    fontSize: "var(--font-size-lg)",
  },
  crossIcon: {
    color: "var(--text-secondary)",
    fontSize: "var(--font-size-lg)",
  },
  emptyState: {
    textAlign: "center",
    padding: "var(--spacing-2xl)",
    color: "var(--text-secondary)",
  },
};

export default function AvailabilityRequest() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [frequency, setFrequency] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [requests, setRequests] = useState([]);
  const [entries, setEntries] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const data = await api.get("/availability-requests");
      setRequests(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.post("/availability-requests", {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        frequency: frequency || undefined,
      });
      setStartDate("");
      setEndDate("");
      setFrequency("");
      
      let successMsg = "Availability request created successfully! A schedule has been automatically created for the same dates.";
      if (frequency && response.recurringRequestsCreated > 0) {
        successMsg += ` ${response.recurringRequestsCreated} future ${frequency.toLowerCase()} request${response.recurringRequestsCreated > 1 ? 's' : ''} and schedule${response.recurringRequestsCreated > 1 ? 's' : ''} have been created automatically.`;
      }
      setSuccess(successMsg);
      loadRequests();
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  }

  async function loadEntries(requestId) {
    try {
      const data = await api.get(`/availability-requests/${requestId}/entries`);
      setEntries(data);
      setSelectedRequestId(requestId);
    } catch (err) {
      setError(err.message || "Failed to load entries");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <Link to="/dashboard" style={styles.backLink}>
            ← Back to Dashboard
          </Link>

          <div style={styles.header}>
            <h1 style={styles.title}>Availability Requests</h1>
            <p style={styles.subtitle}>
              Create and manage availability requests for your team
            </p>
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Create New Request</h2>
            <form onSubmit={handleCreate}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Schedule Frequency (Optional)</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">One-time request</option>
                    <option value="WEEKLY">Weekly (recurring)</option>
                    <option value="BIWEEKLY">Bi-weekly (every 2 weeks)</option>
                    <option value="MONTHLY">Monthly (recurring)</option>
                  </select>
                  <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginTop: "var(--spacing-xs)" }}>
                    If selected, future availability requests will be automatically created based on this frequency
                  </p>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={styles.submitButton}
              >
                {loading ? "Creating..." : "Create Request & Schedule"}
              </button>
            </form>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.requestsTitle}>Existing Requests</h2>
          {requests.length === 0 ? (
            <div style={styles.emptyState}>No requests yet.</div>
          ) : (
            <div style={styles.requestsList}>
              {requests.map((req) => (
                <div key={req.id} style={styles.requestCard}>
                  <div style={styles.requestHeader}>
                    <div>
                      <div style={styles.requestDates}>
                        {new Date(req.startDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        - {new Date(req.endDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <span
                        style={{
                          ...styles.requestStatus,
                          ...(req.status === "OPEN" ? styles.statusOpen : styles.statusClosed),
                        }}
                      >
                        {req.status}
                      </span>
                    </div>
                    <button
                      onClick={() => loadEntries(req.id)}
                      style={styles.viewButton}
                    >
                      View Entries
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {entries && selectedRequestId && (
          <div style={styles.card}>
            <h2 style={styles.requestsTitle}>Availability Entries</h2>
            <table style={styles.entriesTable}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableHeaderCell}>Date</th>
                  <th style={styles.tableHeaderCell}>Employee</th>
                  <th style={styles.tableHeaderCell}>Status</th>
                  <th style={styles.tableHeaderCell}>Morning</th>
                  <th style={styles.tableHeaderCell}>Evening</th>
                  <th style={styles.tableHeaderCell}>Double</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const blocks = typeof entry.blocks === "string" 
                    ? JSON.parse(entry.blocks) 
                    : entry.blocks;
                  const isOff = blocks.off === true;
                  const isDouble = blocks.double === true;
                  const isMorning = blocks.morning === true || isDouble;
                  const isEvening = blocks.evening === true || isDouble;

                  return (
                    <tr key={entry.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td style={styles.tableCell}>{entry.user.name}</td>
                      <td style={styles.tableCell}>
                        {isOff ? (
                          <span style={{ color: "var(--error)", fontWeight: 600 }}>Off / NA</span>
                        ) : (
                          <span style={{ color: "var(--success)", fontWeight: 600 }}>Available</span>
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        {isOff ? (
                          <span style={styles.crossIcon}>—</span>
                        ) : isMorning ? (
                          <span style={styles.checkIcon}>✓</span>
                        ) : (
                          <span style={styles.crossIcon}>✗</span>
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        {isOff ? (
                          <span style={styles.crossIcon}>—</span>
                        ) : isEvening ? (
                          <span style={styles.checkIcon}>✓</span>
                        ) : (
                          <span style={styles.crossIcon}>✗</span>
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        {isOff ? (
                          <span style={styles.crossIcon}>—</span>
                        ) : isDouble ? (
                          <span style={styles.checkIcon}>✓</span>
                        ) : (
                          <span style={styles.crossIcon}>✗</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
