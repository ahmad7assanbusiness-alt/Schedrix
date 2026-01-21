import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    maxWidth: "900px",
    margin: "0 auto",
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
  },
  error: {
    padding: "var(--spacing-md)",
    backgroundColor: "var(--error-light)",
    color: "var(--error-text)",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--spacing-lg)",
    border: "1px solid var(--error)",
  },
  dateCard: {
    background: "var(--bg-primary)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-lg)",
    marginBottom: "var(--spacing-lg)",
    transition: "all var(--transition-base)",
  },
  dateHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "var(--spacing-md)",
    paddingBottom: "var(--spacing-md)",
    borderBottom: "1px solid var(--gray-200)",
  },
  dateTitle: {
    fontSize: "var(--font-size-xl)",
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  dateSubtitle: {
    fontSize: "var(--font-size-sm)",
    color: "var(--text-secondary)",
    fontWeight: 500,
  },
  shiftOptions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "var(--spacing-md)",
    marginBottom: "var(--spacing-md)",
  },
  shiftOption: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    padding: "var(--spacing-md)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
    background: "var(--bg-primary)",
  },
  shiftOptionSelected: {
    borderColor: "var(--primary)",
    background: "var(--primary-light)",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
  },
  shiftOptionInput: {
    position: "absolute",
    opacity: 0,
    cursor: "pointer",
  },
  shiftOptionLabel: {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-sm)",
    cursor: "pointer",
  },
  shiftOptionIcon: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "2px solid var(--gray-300)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all var(--transition-base)",
  },
  shiftOptionIconSelected: {
    borderColor: "var(--primary)",
    background: "var(--primary)",
  },
  shiftOptionCheck: {
    color: "white",
    fontSize: "14px",
    fontWeight: "bold",
  },
  shiftOptionTitle: {
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  timeSlotContainer: {
    marginTop: "var(--spacing-md)",
    padding: "var(--spacing-md)",
    background: "var(--bg-secondary)",
    borderRadius: "var(--radius-md)",
  },
  timeSlotGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "var(--spacing-md)",
  },
  timeSlotGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-sm)",
  },
  timeSlotLabel: {
    fontSize: "var(--font-size-xs)",
    fontWeight: 600,
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  timeSlotRow: {
    display: "flex",
    gap: "var(--spacing-sm)",
    alignItems: "center",
  },
  timeSlotInput: {
    flex: 1,
    padding: "var(--spacing-sm) var(--spacing-md)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
    fontFamily: "monospace",
    transition: "all var(--transition-base)",
  },
  timeSlotSelect: {
    padding: "var(--spacing-sm) var(--spacing-md)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
    fontFamily: "monospace",
    background: "var(--bg-primary)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
  },
  submitButton: {
    width: "100%",
    padding: "var(--spacing-md) var(--spacing-xl)",
    fontSize: "var(--font-size-lg)",
    fontWeight: 700,
    background: "linear-gradient(135deg, var(--success) 0%, #059669 100%)",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
    boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)",
    marginTop: "var(--spacing-xl)",
  },
  loading: {
    textAlign: "center",
    padding: "var(--spacing-2xl)",
    color: "var(--text-secondary)",
    fontSize: "var(--font-size-lg)",
  },
  noRequest: {
    textAlign: "center",
    padding: "var(--spacing-2xl)",
    color: "var(--text-secondary)",
  },
  noRequestTitle: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 700,
    marginBottom: "var(--spacing-md)",
    color: "var(--text-primary)",
  },
};

// Convert 12-hour format to 24-hour format
function convert12To24(time12, ampm) {
  if (!time12) return null;
  const [hours, minutes] = time12.split(":").map(Number);
  let hours24 = hours;
  if (ampm === "PM" && hours !== 12) {
    hours24 = hours + 12;
  } else if (ampm === "AM" && hours === 12) {
    hours24 = 0;
  }
  return `${String(hours24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Convert 24-hour format to 12-hour format
function convert24To12(time24) {
  if (!time24) return { time: "12:00", ampm: "AM" };
  const [hours, minutes] = time24.split(":").map(Number);
  let hours12 = hours;
  const ampm = hours >= 12 ? "PM" : "AM";
  if (hours === 0) {
    hours12 = 12;
  } else if (hours > 12) {
    hours12 = hours - 12;
  }
  return { time: `${hours12}:${String(minutes).padStart(2, "0")}`, ampm };
}

export default function AvailabilitySubmit() {
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRequest();
  }, []);

  async function loadRequest() {
    try {
      const data = await api.get("/availability-requests/open");
      if (!data) {
        setError("No open availability request");
        setLoading(false);
        return;
      }
      setRequest(data);
      initializeEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function initializeEntries(requestData) {
    const start = new Date(requestData.startDate);
    const end = new Date(requestData.endDate);
    const newEntries = {};
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split("T")[0];
      const morning12 = convert24To12("09:00");
      const morningEnd12 = convert24To12("17:00");
      const evening12 = convert24To12("17:00");
      const eveningEnd12 = convert24To12("21:00");
      newEntries[dateKey] = {
        shiftType: null, // "morning", "evening", "double", "off", or null
        morningStartTime: morning12.time,
        morningStartAmPm: morning12.ampm,
        morningEndTime: morningEnd12.time,
        morningEndAmPm: morningEnd12.ampm,
        eveningStartTime: evening12.time,
        eveningStartAmPm: evening12.ampm,
        eveningEndTime: eveningEnd12.time,
        eveningEndAmPm: eveningEnd12.ampm,
      };
    }
    setEntries(newEntries);
  }

  function setShiftType(dateKey, shiftType) {
    setEntries((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        shiftType,
      },
    }));
  }

  function setTimeSlot(dateKey, field, value) {
    setEntries((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [field]: value,
      },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const entriesArray = Object.entries(entries)
        .filter(([_, entry]) => entry.shiftType !== null)
        .map(([dateKey, entry]) => {
          const isOff = entry.shiftType === "off";
          const isDouble = entry.shiftType === "double";
          const isMorning = entry.shiftType === "morning" || isDouble;
          const isEvening = entry.shiftType === "evening" || isDouble;

          return {
            date: new Date(dateKey).toISOString(),
            off: isOff,
            morning: isMorning,
            evening: isEvening,
            double: isDouble,
            morningStartTime: isMorning
              ? convert12To24(entry.morningStartTime, entry.morningStartAmPm)
              : undefined,
            morningEndTime: isMorning
              ? convert12To24(entry.morningEndTime, entry.morningEndAmPm)
              : undefined,
            eveningStartTime: isEvening
              ? convert12To24(entry.eveningStartTime, entry.eveningStartAmPm)
              : undefined,
            eveningEndTime: isEvening
              ? convert12To24(entry.eveningEndTime, entry.eveningEndAmPm)
              : undefined,
          };
        });

      await api.post("/availability-requests/entries", {
        requestId: request.id,
        entries: entriesArray,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to submit availability");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.loading}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <Link to="/dashboard" style={styles.backLink}>
              ← Back to Dashboard
            </Link>
            <div style={styles.noRequest}>
              <h1 style={styles.noRequestTitle}>Submit Availability</h1>
              {error && <div style={styles.error}>{error}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dates = Object.keys(entries).sort();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <Link to="/dashboard" style={styles.backLink}>
            ← Back to Dashboard
          </Link>

          <div style={styles.header}>
            <h1 style={styles.title}>Submit Your Availability</h1>
            <p style={styles.subtitle}>
              Period: {new Date(request.startDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              - {new Date(request.endDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {dates.map((dateKey) => {
              const entry = entries[dateKey];
              const date = new Date(dateKey);
              const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
              const dateStr = date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              });

              return (
                <div key={dateKey} style={styles.dateCard}>
                  <div style={styles.dateHeader}>
                    <div>
                      <div style={styles.dateTitle}>{dayName}</div>
                      <div style={styles.dateSubtitle}>{dateStr}</div>
                    </div>
                  </div>

                  <div style={styles.shiftOptions}>
                    <label
                      style={{
                        ...styles.shiftOption,
                        ...(entry.shiftType === "morning" ? styles.shiftOptionSelected : {}),
                      }}
                    >
                      <input
                        type="radio"
                        name={`shift-${dateKey}`}
                        checked={entry.shiftType === "morning"}
                        onChange={() => setShiftType(dateKey, "morning")}
                        style={styles.shiftOptionInput}
                      />
                      <div style={styles.shiftOptionLabel}>
                        <div
                          style={{
                            ...styles.shiftOptionIcon,
                            ...(entry.shiftType === "morning"
                              ? styles.shiftOptionIconSelected
                              : {}),
                          }}
                        >
                          {entry.shiftType === "morning" && (
                            <span style={styles.shiftOptionCheck}>✓</span>
                          )}
                        </div>
                        <span style={styles.shiftOptionTitle}>Morning Shift</span>
                      </div>
                    </label>

                    <label
                      style={{
                        ...styles.shiftOption,
                        ...(entry.shiftType === "evening" ? styles.shiftOptionSelected : {}),
                      }}
                    >
                      <input
                        type="radio"
                        name={`shift-${dateKey}`}
                        checked={entry.shiftType === "evening"}
                        onChange={() => setShiftType(dateKey, "evening")}
                        style={styles.shiftOptionInput}
                      />
                      <div style={styles.shiftOptionLabel}>
                        <div
                          style={{
                            ...styles.shiftOptionIcon,
                            ...(entry.shiftType === "evening"
                              ? styles.shiftOptionIconSelected
                              : {}),
                          }}
                        >
                          {entry.shiftType === "evening" && (
                            <span style={styles.shiftOptionCheck}>✓</span>
                          )}
                        </div>
                        <span style={styles.shiftOptionTitle}>Evening Shift</span>
                      </div>
                    </label>

                    <label
                      style={{
                        ...styles.shiftOption,
                        ...(entry.shiftType === "double" ? styles.shiftOptionSelected : {}),
                      }}
                    >
                      <input
                        type="radio"
                        name={`shift-${dateKey}`}
                        checked={entry.shiftType === "double"}
                        onChange={() => setShiftType(dateKey, "double")}
                        style={styles.shiftOptionInput}
                      />
                      <div style={styles.shiftOptionLabel}>
                        <div
                          style={{
                            ...styles.shiftOptionIcon,
                            ...(entry.shiftType === "double"
                              ? styles.shiftOptionIconSelected
                              : {}),
                          }}
                        >
                          {entry.shiftType === "double" && (
                            <span style={styles.shiftOptionCheck}>✓</span>
                          )}
                        </div>
                        <span style={styles.shiftOptionTitle}>Double Shift</span>
                      </div>
                    </label>

                    <label
                      style={{
                        ...styles.shiftOption,
                        ...(entry.shiftType === "off" ? styles.shiftOptionSelected : {}),
                      }}
                    >
                      <input
                        type="radio"
                        name={`shift-${dateKey}`}
                        checked={entry.shiftType === "off"}
                        onChange={() => setShiftType(dateKey, "off")}
                        style={styles.shiftOptionInput}
                      />
                      <div style={styles.shiftOptionLabel}>
                        <div
                          style={{
                            ...styles.shiftOptionIcon,
                            ...(entry.shiftType === "off"
                              ? styles.shiftOptionIconSelected
                              : {}),
                          }}
                        >
                          {entry.shiftType === "off" && (
                            <span style={styles.shiftOptionCheck}>✓</span>
                          )}
                        </div>
                        <span style={styles.shiftOptionTitle}>Off / NA</span>
                      </div>
                    </label>
                  </div>

                  {(entry.shiftType === "morning" || entry.shiftType === "double") && (
                    <div style={styles.timeSlotContainer}>
                      <div style={styles.timeSlotGrid}>
                        <div style={styles.timeSlotGroup}>
                          <label style={styles.timeSlotLabel}>Morning Start Time</label>
                          <div style={styles.timeSlotRow}>
                            <input
                              type="text"
                              pattern="[0-9]{1,2}:[0-5][0-9]"
                              placeholder="9:00"
                              value={entry.morningStartTime}
                              onChange={(e) => setTimeSlot(dateKey, "morningStartTime", e.target.value)}
                              style={styles.timeSlotInput}
                            />
                            <select
                              value={entry.morningStartAmPm}
                              onChange={(e) => setTimeSlot(dateKey, "morningStartAmPm", e.target.value)}
                              style={styles.timeSlotSelect}
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>
                        <div style={styles.timeSlotGroup}>
                          <label style={styles.timeSlotLabel}>Morning End Time</label>
                          <div style={styles.timeSlotRow}>
                            <input
                              type="text"
                              pattern="[0-9]{1,2}:[0-5][0-9]"
                              placeholder="5:00"
                              value={entry.morningEndTime}
                              onChange={(e) => setTimeSlot(dateKey, "morningEndTime", e.target.value)}
                              style={styles.timeSlotInput}
                            />
                            <select
                              value={entry.morningEndAmPm}
                              onChange={(e) => setTimeSlot(dateKey, "morningEndAmPm", e.target.value)}
                              style={styles.timeSlotSelect}
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {(entry.shiftType === "evening" || entry.shiftType === "double") && (
                    <div style={styles.timeSlotContainer}>
                      <div style={styles.timeSlotGrid}>
                        <div style={styles.timeSlotGroup}>
                          <label style={styles.timeSlotLabel}>Evening Start Time</label>
                          <div style={styles.timeSlotRow}>
                            <input
                              type="text"
                              pattern="[0-9]{1,2}:[0-5][0-9]"
                              placeholder="5:00"
                              value={entry.eveningStartTime}
                              onChange={(e) => setTimeSlot(dateKey, "eveningStartTime", e.target.value)}
                              style={styles.timeSlotInput}
                            />
                            <select
                              value={entry.eveningStartAmPm}
                              onChange={(e) => setTimeSlot(dateKey, "eveningStartAmPm", e.target.value)}
                              style={styles.timeSlotSelect}
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>
                        <div style={styles.timeSlotGroup}>
                          <label style={styles.timeSlotLabel}>Evening End Time</label>
                          <div style={styles.timeSlotRow}>
                            <input
                              type="text"
                              pattern="[0-9]{1,2}:[0-5][0-9]"
                              placeholder="9:00"
                              value={entry.eveningEndTime}
                              onChange={(e) => setTimeSlot(dateKey, "eveningEndTime", e.target.value)}
                              style={styles.timeSlotInput}
                            />
                            <select
                              value={entry.eveningEndAmPm}
                              onChange={(e) => setTimeSlot(dateKey, "eveningEndAmPm", e.target.value)}
                              style={styles.timeSlotSelect}
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="submit"
              disabled={submitting}
              style={styles.submitButton}
            >
              {submitting ? "Submitting..." : "Submit Availability"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
