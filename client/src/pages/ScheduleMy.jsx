import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../auth/useAuth.js";
import "../index.css";

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundAttachment: "fixed",
    padding: "var(--spacing-xl)",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  card: {
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    borderRadius: "var(--radius-2xl)",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    padding: "var(--spacing-2xl)",
    marginBottom: "var(--spacing-xl)",
    animation: "fadeIn 0.6s ease-out",
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
  error: {
    padding: "var(--spacing-md)",
    backgroundColor: "var(--error-light)",
    color: "#991b1b",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--spacing-lg)",
    border: "1px solid var(--error)",
  },
  scheduleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "var(--spacing-xl)",
    paddingBottom: "var(--spacing-lg)",
    borderBottom: "2px solid var(--gray-200)",
  },
  viewToggle: {
    display: "flex",
    gap: "var(--spacing-sm)",
    alignItems: "center",
  },
  toggleButton: {
    padding: "var(--spacing-sm) var(--spacing-lg)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    border: "2px solid var(--gray-300)",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
    background: "white",
    color: "var(--gray-700)",
  },
  toggleButtonActive: {
    background: "var(--primary)",
    color: "white",
    borderColor: "var(--primary)",
  },
  tableContainer: {
    overflowX: "auto",
    marginTop: "var(--spacing-xl)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-lg)",
    background: "white",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0",
    minWidth: "800px",
  },
  tableHeader: {
    backgroundColor: "var(--gray-100)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  tableHeaderCell: {
    padding: "var(--spacing-md)",
    borderBottom: "2px solid var(--gray-200)",
    borderRight: "1px solid var(--gray-200)",
    textAlign: "left",
    fontWeight: 700,
    fontSize: "var(--font-size-sm)",
    color: "var(--gray-700)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tableHeaderCellFirst: {
    padding: "var(--spacing-md)",
    borderBottom: "2px solid var(--gray-200)",
    borderRight: "1px solid var(--gray-200)",
    textAlign: "left",
    fontWeight: 700,
    fontSize: "var(--font-size-sm)",
    color: "var(--gray-700)",
    backgroundColor: "var(--gray-100)",
    position: "sticky",
    left: 0,
    zIndex: 11,
    minWidth: "150px",
  },
  tableRow: {
    transition: "background-color var(--transition-base)",
  },
  tableRowEven: {
    backgroundColor: "white",
  },
  tableRowOdd: {
    backgroundColor: "var(--gray-50)",
  },
  tableCell: {
    padding: "var(--spacing-md)",
    borderBottom: "1px solid var(--gray-200)",
    borderRight: "1px solid var(--gray-200)",
    verticalAlign: "top",
    minHeight: "60px",
    position: "relative",
  },
  tableCellFirst: {
    padding: "var(--spacing-md)",
    borderBottom: "1px solid var(--gray-200)",
    borderRight: "1px solid var(--gray-200)",
    fontWeight: 600,
    color: "var(--gray-900)",
    backgroundColor: "inherit",
    position: "sticky",
    left: 0,
    zIndex: 5,
    minWidth: "150px",
  },
  emptyCell: {
    color: "var(--gray-400)",
    fontSize: "var(--font-size-sm)",
    textAlign: "center",
    padding: "var(--spacing-sm)",
  },
  assignmentBadge: {
    padding: "var(--spacing-xs) var(--spacing-sm)",
    marginBottom: "var(--spacing-xs)",
    background: "var(--primary-light)",
    borderRadius: "var(--radius-sm)",
    fontSize: "var(--font-size-sm)",
    transition: "all var(--transition-base)",
  },
  assignmentBadgeMyShift: {
    background: "var(--success-light)",
    border: "2px solid var(--success)",
  },
  schedulesList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "var(--spacing-lg)",
    marginTop: "var(--spacing-xl)",
  },
  scheduleCard: {
    background: "white",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-lg)",
    boxShadow: "var(--shadow-sm)",
    transition: "all var(--transition-base)",
    cursor: "pointer",
  },
  scheduleCardSelected: {
    borderColor: "var(--primary)",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
  },
  scheduleDateRange: {
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    color: "var(--gray-900)",
    marginBottom: "var(--spacing-sm)",
  },
};

export default function ScheduleMy() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("redacted"); // "redacted" or "full"

  useEffect(() => {
    loadSchedules();
  }, []);

  async function loadSchedules() {
    try {
      const data = await api.get("/schedules");
      const published = data.filter((s) => s.status === "PUBLISHED");
      setSchedules(published);
      if (published.length > 0 && !selectedSchedule) {
        loadSchedule(published[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSchedule(scheduleId) {
    try {
      const data = await api.get(`/schedules/${scheduleId}`);
      setSelectedSchedule(data);
    } catch (err) {
      setError(err.message);
    }
  }

  function getDates() {
    if (!selectedSchedule) return [];
    
    // If custom columns are defined, use them but split each into morning/evening
    if (selectedSchedule.columns && Array.isArray(selectedSchedule.columns) && selectedSchedule.columns.length > 0) {
      const result = [];
      selectedSchedule.columns.forEach((col, index) => {
        const date = col.date ? new Date(col.date) : null;
        const dayLabel = col.label || (date ? date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }) : `Column ${index + 1}`);
        
        // Add morning shift column
        result.push({
          label: dayLabel,
          date: date,
          index: result.length,
          shiftType: "morning",
          dayIndex: index,
        });
        
        // Add evening shift column
        result.push({
          label: dayLabel,
          date: date,
          index: result.length,
          shiftType: "evening",
          dayIndex: index,
        });
      });
      return result;
    }
    
    // Otherwise, generate dates from startDate to endDate, split into morning/evening
    const start = new Date(selectedSchedule.startDate);
    const end = new Date(selectedSchedule.endDate);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayLabel = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const dayDate = new Date(d);
      
      // Add morning shift column
      dates.push({
        label: dayLabel,
        date: dayDate,
        index: dates.length,
        shiftType: "morning",
      });
      
      // Add evening shift column
      dates.push({
        label: dayLabel,
        date: dayDate,
        index: dates.length,
        shiftType: "evening",
      });
    }
    return dates;
  }

  function getPositions() {
    if (!selectedSchedule) return [];
    if (selectedSchedule.rows && Array.isArray(selectedSchedule.rows)) {
      return selectedSchedule.rows;
    }
    // Extract unique positions from assignments
    const positions = new Set();
    if (selectedSchedule.assignments) {
      selectedSchedule.assignments.forEach((a) => {
        if (a.position) positions.add(a.position);
      });
    }
    return Array.from(positions).sort();
  }

  function getAssignmentsForDateAndPosition(dateObj, position) {
    if (!selectedSchedule || !selectedSchedule.assignments) return [];
    
    const targetDate = dateObj.date;
    const shiftType = dateObj.shiftType;
    
    let assignments = selectedSchedule.assignments.filter((assignment) => {
      const assignmentDate = new Date(assignment.date);
      const assignmentDateStr = assignmentDate.toISOString().split("T")[0];
      const targetDateStr = targetDate ? targetDate.toISOString().split("T")[0] : null;
      
      return (
        assignment.position === position &&
        assignmentDateStr === targetDateStr &&
        assignment.shiftType === shiftType
      );
    });

    // Filter based on view mode
    if (viewMode === "redacted") {
      assignments = assignments.filter((a) => a.assignedUserId === user?.id);
    }
    // If viewMode === "full", show all assignments

    return assignments;
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={{ textAlign: "center", padding: "var(--spacing-2xl)" }}>
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dates = getDates();
  const positions = getPositions();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <Link to="/dashboard" style={styles.backLink}>
            ← Back to Dashboard
          </Link>

          <div style={styles.header}>
            <h1 style={styles.title}>My Schedule</h1>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          {schedules.length > 0 && (
            <div style={styles.schedulesList}>
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  onClick={() => loadSchedule(schedule.id)}
                  style={{
                    ...styles.scheduleCard,
                    ...(selectedSchedule?.id === schedule.id
                      ? styles.scheduleCardSelected
                      : {}),
                  }}
                >
                  <div style={styles.scheduleDateRange}>
                    {new Date(schedule.startDate).toLocaleDateString()} -{" "}
                    {new Date(schedule.endDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedSchedule && (
            <div>
              <div style={styles.scheduleHeader}>
                <div>
                  <h2 style={styles.title}>
                    Schedule: {new Date(selectedSchedule.startDate).toLocaleDateString()} -{" "}
                    {new Date(selectedSchedule.endDate).toLocaleDateString()}
                  </h2>
                </div>
                <div style={styles.viewToggle}>
                  <label style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--gray-700)" }}>
                    View:
                  </label>
                  <button
                    onClick={() => setViewMode("redacted")}
                    style={{
                      ...styles.toggleButton,
                      ...(viewMode === "redacted" ? styles.toggleButtonActive : {}),
                    }}
                  >
                    My Shifts Only
                  </button>
                  <button
                    onClick={() => setViewMode("full")}
                    style={{
                      ...styles.toggleButton,
                      ...(viewMode === "full" ? styles.toggleButtonActive : {}),
                    }}
                  >
                    Full Schedule
                  </button>
                </div>
              </div>

              {dates.length > 0 && positions.length > 0 ? (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th rowSpan={2} style={styles.tableHeaderCellFirst}>
                          Position
                        </th>
                        {(() => {
                          // Group dates by day to show day headers
                          const dayGroups = {};
                          dates.forEach((dateObj) => {
                            const dayKey = dateObj.date ? dateObj.date.toISOString().split("T")[0] : dateObj.dayIndex;
                            if (!dayGroups[dayKey]) {
                              dayGroups[dayKey] = {
                                date: dateObj.date,
                                label: dateObj.label,
                                shifts: [],
                              };
                            }
                            dayGroups[dayKey].shifts.push(dateObj);
                          });
                          return Object.values(dayGroups).map((dayGroup, dayIdx) => (
                            <th
                              key={dayGroup.date ? dayGroup.date.toISOString() : `day-${dayIdx}`}
                              colSpan={2}
                              style={{
                                ...styles.tableHeaderCell,
                                textAlign: "center",
                                fontWeight: 700,
                                backgroundColor: "var(--gray-100)",
                              }}
                            >
                              {dayGroup.label || (dayGroup.date ? dayGroup.date.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              }) : `Day ${dayIdx + 1}`)}
                            </th>
                          ));
                        })()}
                      </tr>
                      <tr>
                        {dates.map((dateObj, idx) => (
                          <th key={dateObj.date ? `${dateObj.date.toISOString()}-${dateObj.shiftType}` : `col-${idx}`} style={styles.tableHeaderCell}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600 }}>
                                {dateObj.shiftType === "morning" ? "Morning" : "Evening"}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((position, rowIndex) => (
                        <tr
                          key={position}
                          style={{
                            ...styles.tableRow,
                            ...(rowIndex % 2 === 0
                              ? styles.tableRowEven
                              : styles.tableRowOdd),
                          }}
                        >
                          <td style={styles.tableCellFirst}>
                            {position}
                          </td>
                          {dates.map((dateObj, dateIdx) => {
                            const assignments = getAssignmentsForDateAndPosition(dateObj, position);
                            const dateKey = dateObj.date ? dateObj.date.toISOString() : `col-${dateIdx}`;
                            return (
                              <td
                                key={dateKey}
                                style={styles.tableCell}
                              >
                                {assignments.length === 0 ? (
                                  <div style={styles.emptyCell}>
                                    {viewMode === "redacted" ? "" : "—"}
                                  </div>
                                ) : (
                                  assignments.map((assignment) => {
                                    const isMyShift = assignment.assignedUserId === user?.id;
                                    return (
                                      <div
                                        key={assignment.id}
                                        style={{
                                          ...styles.assignmentBadge,
                                          ...(isMyShift ? styles.assignmentBadgeMyShift : {}),
                                        }}
                                      >
                                        <div style={{ fontWeight: 600 }}>
                                          {assignment.assignedUser?.name || "Unassigned"}
                                        </div>
                                        {assignment.startTime && assignment.endTime && (
                                          <div
                                            style={{
                                              fontSize: "var(--font-size-xs)",
                                              color: "var(--gray-600)",
                                            }}
                                          >
                                            {assignment.startTime} - {assignment.endTime}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "var(--spacing-xl)", color: "var(--gray-500)" }}>
                  No schedule data available.
                </div>
              )}
            </div>
          )}

          {schedules.length === 0 && (
            <div style={{ textAlign: "center", padding: "var(--spacing-xl)", color: "var(--gray-500)" }}>
              No published schedules available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
