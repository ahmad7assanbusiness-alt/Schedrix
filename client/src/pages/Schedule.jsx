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
    color: "var(--gray-600)",
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
    color: "#991b1b",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--spacing-lg)",
    border: "1px solid var(--error)",
  },
  formCard: {
    background: "white",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-xl)",
    marginBottom: "var(--spacing-xl)",
    boxShadow: "var(--shadow-md)",
  },
  formTitle: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 700,
    color: "var(--gray-900)",
    marginBottom: "var(--spacing-xl)",
    textAlign: "center",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "var(--spacing-lg)",
    marginBottom: "var(--spacing-xl)",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-sm)",
  },
  label: {
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    color: "var(--gray-700)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
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
  },
  select: {
    width: "100%",
    padding: "0.875rem 1rem",
    fontSize: "var(--font-size-base)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-md)",
    background: "white",
    color: "var(--gray-900)",
    cursor: "pointer",
  },
  submitButton: {
    width: "100%",
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
  statusBadge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "var(--font-size-xs)",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "inline-block",
  },
  statusDraft: {
    backgroundColor: "var(--warning-light)",
    color: "#92400e",
  },
  statusPublished: {
    backgroundColor: "var(--success-light)",
    color: "#065f46",
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
    cursor: "pointer",
    position: "relative",
  },
  tableCellDragOver: {
    backgroundColor: "var(--primary-light)",
    border: "2px dashed var(--primary)",
  },
  assignmentBadgeDragging: {
    opacity: 0.5,
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
    cursor: "pointer",
    transition: "all var(--transition-base)",
    "&:hover": {
      background: "var(--primary)",
      color: "white",
    },
  },
  scheduleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "var(--spacing-xl)",
    paddingBottom: "var(--spacing-lg)",
    borderBottom: "2px solid var(--gray-200)",
  },
  publishButton: {
    padding: "var(--spacing-sm) var(--spacing-lg)",
    fontSize: "var(--font-size-base)",
    fontWeight: 700,
    background: "linear-gradient(135deg, var(--success) 0%, #059669 100%)",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
    boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "var(--spacing-xl)",
  },
  modal: {
    background: "white",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-2xl)",
    maxWidth: "500px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  modalHeader: {
    marginBottom: "var(--spacing-xl)",
    paddingBottom: "var(--spacing-lg)",
    borderBottom: "2px solid var(--gray-200)",
  },
  modalTitle: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 700,
    color: "var(--gray-900)",
    marginBottom: "var(--spacing-sm)",
  },
  modalClose: {
    position: "absolute",
    top: "var(--spacing-md)",
    right: "var(--spacing-md)",
    background: "none",
    border: "none",
    fontSize: "var(--font-size-2xl)",
    cursor: "pointer",
    color: "var(--gray-500)",
    padding: "var(--spacing-sm)",
    lineHeight: 1,
  },
  modalButton: {
    padding: "var(--spacing-sm) var(--spacing-lg)",
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    border: "none",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
  },
  modalButtonPrimary: {
    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
    color: "white",
    boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.39)",
  },
  modalButtonDanger: {
    background: "var(--error)",
    color: "white",
    marginTop: "var(--spacing-md)",
  },
  modalButtonGroup: {
    display: "flex",
    gap: "var(--spacing-md)",
    marginTop: "var(--spacing-xl)",
  },
  deleteButton: {
    background: "var(--error)",
    color: "white",
    border: "none",
    padding: "var(--spacing-xs) var(--spacing-sm)",
    borderRadius: "var(--radius-sm)",
    fontSize: "var(--font-size-xs)",
    cursor: "pointer",
    marginTop: "var(--spacing-xs)",
  },
};

export default function Schedule() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [modalPosition, setModalPosition] = useState("");
  const [modalAssignment, setModalAssignment] = useState(null);
  const [modalEmployeeId, setModalEmployeeId] = useState("");
  const [modalStartTime, setModalStartTime] = useState("09:00");
  const [modalEndTime, setModalEndTime] = useState("17:00");
  const [draggedAssignment, setDraggedAssignment] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  async function loadSchedules() {
    try {
      const data = await api.get("/schedules");
      setSchedules(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const schedule = await api.post("/schedules", {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      setStartDate("");
      setEndDate("");
      loadSchedules();
      loadSchedule(schedule.id);
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
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function publishSchedule() {
    try {
      await api.post(`/schedules/${selectedSchedule.id}/publish`);
      loadSchedule(selectedSchedule.id);
      loadSchedules();
    } catch (err) {
      setError(err.message);
    }
  }

  function getDates() {
    if (!selectedSchedule) return [];
    const start = new Date(selectedSchedule.startDate);
    const end = new Date(selectedSchedule.endDate);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  }

  function getAssignmentsForDateAndPosition(date, position) {
    if (!selectedSchedule || !selectedSchedule.assignments) return [];
    const dateStr = new Date(date).toISOString().split("T")[0];
    return selectedSchedule.assignments.filter(
      (a) =>
        new Date(a.date).toISOString().split("T")[0] === dateStr &&
        a.position === position
    );
  }

  function getUniquePositions() {
    if (!selectedSchedule || !selectedSchedule.assignments) return [];
    const positions = new Set();
    selectedSchedule.assignments.forEach((a) => {
      if (a.position) {
        positions.add(a.position);
      }
    });
    return Array.from(positions).sort();
  }

  function openModal(date, position, assignment = null) {
    if (selectedSchedule.status === "PUBLISHED") return;
    setModalDate(date);
    setModalPosition(position || "");
    setModalAssignment(assignment);
    if (assignment) {
      setModalEmployeeId(assignment.assignedUserId || "");
      setModalStartTime(assignment.startTime || "09:00");
      setModalEndTime(assignment.endTime || "17:00");
    } else {
      setModalEmployeeId("");
      setModalStartTime("09:00");
      setModalEndTime("17:00");
    }
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalDate(null);
    setModalPosition("");
    setModalAssignment(null);
    setModalEmployeeId("");
    setModalStartTime("09:00");
    setModalEndTime("17:00");
  }

  async function handleSaveAssignment() {
    if (!modalDate || !modalPosition) {
      setError("Position is required");
      return;
    }
    try {
      if (modalAssignment) {
        // Update existing assignment
        await api.put(
          `/schedules/${selectedSchedule.id}/assignments/${modalAssignment.id}`,
          {
            position: modalPosition,
            assignedUserId: modalEmployeeId || null,
            startTime: modalStartTime,
            endTime: modalEndTime,
          }
        );
      } else {
        // Create new assignment
        await api.post(`/schedules/${selectedSchedule.id}/assignments`, {
          date: new Date(modalDate).toISOString(),
          position: modalPosition,
          assignedUserId: modalEmployeeId || null,
          startTime: modalStartTime,
          endTime: modalEndTime,
        });
      }
      closeModal();
      loadSchedule(selectedSchedule.id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteAssignment() {
    if (!modalAssignment) return;
    try {
      await api.delete(
        `/schedules/${selectedSchedule.id}/assignments/${modalAssignment.id}`
      );
      closeModal();
      loadSchedule(selectedSchedule.id);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleDragStart(e, assignment) {
    if (selectedSchedule.status === "PUBLISHED") return;
    setDraggedAssignment(assignment);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", assignment.id);
  }

  function handleDragOver(e, date, position) {
    if (selectedSchedule.status === "PUBLISHED") return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCell({ date, position });
  }

  function handleDragLeave(e) {
    setDragOverCell(null);
  }

  async function handleDrop(e, targetDate, targetPosition) {
    e.preventDefault();
    setDragOverCell(null);
    
    if (!draggedAssignment || selectedSchedule.status === "PUBLISHED") return;
    
    const targetDateStr = new Date(targetDate).toISOString().split("T")[0];
    const sourceDateStr = new Date(draggedAssignment.date).toISOString().split("T")[0];
    
    // Only update if dropped on a different cell
    if (targetDateStr !== sourceDateStr || targetPosition !== draggedAssignment.position) {
      try {
        await api.put(
          `/schedules/${selectedSchedule.id}/assignments/${draggedAssignment.id}`,
          {
            position: targetPosition,
            assignedUserId: draggedAssignment.assignedUserId || null,
            startTime: draggedAssignment.startTime || "09:00",
            endTime: draggedAssignment.endTime || "17:00",
          }
        );
        // Also update the date by creating a new assignment and deleting the old one
        // Or update via the API if it supports date updates
        // For now, we'll update position and reload
        loadSchedule(selectedSchedule.id);
      } catch (err) {
        setError(err.message || "Failed to move assignment");
      }
    }
    setDraggedAssignment(null);
  }

  const dates = getDates();
  const positions = getUniquePositions();

  return (
    <>
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <Link to="/dashboard" style={styles.backLink}>
              ← Back to Dashboard
            </Link>

            <div style={styles.header}>
              <h1 style={styles.title}>Schedule Builder</h1>
              <p style={styles.subtitle}>
                Create and manage schedules for your team
              </p>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.formCard}>
              <h2 style={styles.formTitle}>Create New Schedule</h2>
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
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={styles.submitButton}
                >
                  {loading ? "Creating..." : "Create Schedule"}
                </button>
              </form>
            </div>

            <div>
              <h2 style={styles.formTitle}>Existing Schedules</h2>
              {schedules.length === 0 ? (
                <div style={{ textAlign: "center", padding: "var(--spacing-xl)", color: "var(--gray-500)" }}>
                  No schedules yet. Create one above.
                </div>
              ) : (
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
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(schedule.status === "PUBLISHED"
                            ? styles.statusPublished
                            : styles.statusDraft),
                        }}
                      >
                        {schedule.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedSchedule && (
            <div style={styles.card}>
              <div style={styles.scheduleHeader}>
                <div>
                  <h2 style={styles.title}>
                    Schedule: {new Date(selectedSchedule.startDate).toLocaleDateString()} -{" "}
                    {new Date(selectedSchedule.endDate).toLocaleDateString()}
                  </h2>
                  <span
                    style={{
                      ...styles.statusBadge,
                      ...(selectedSchedule.status === "PUBLISHED"
                        ? styles.statusPublished
                        : styles.statusDraft),
                    }}
                  >
                    {selectedSchedule.status}
                  </span>
                </div>
                {selectedSchedule.status === "DRAFT" && (
                  <button onClick={publishSchedule} style={styles.publishButton}>
                    Publish Schedule
                  </button>
                )}
              </div>

              {dates.length > 0 ? (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHeaderCellFirst}>Position</th>
                        {dates.map((date) => (
                          <th key={date.toISOString()} style={styles.tableHeaderCell}>
                            {date.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {positions.length === 0 ? (
                        <tr>
                          <td colSpan={dates.length + 1} style={{ padding: "var(--spacing-xl)", textAlign: "center", color: "var(--gray-500)" }}>
                            Click on any cell to create an assignment. Positions will be created automatically.
                          </td>
                        </tr>
                      ) : (
                        positions.map((position, rowIndex) => (
                          <tr
                            key={position}
                            style={{
                              ...styles.tableRow,
                              ...(rowIndex % 2 === 0
                                ? styles.tableRowEven
                                : styles.tableRowOdd),
                            }}
                          >
                            <td style={styles.tableCellFirst}>{position}</td>
                            {dates.map((date) => {
                              const assignments = getAssignmentsForDateAndPosition(
                                date,
                                position
                              );
                              const isDragOver = dragOverCell?.date?.toISOString() === date.toISOString() && dragOverCell?.position === position;
                              return (
                                <td
                                  key={date.toISOString()}
                                  style={{
                                    ...styles.tableCell,
                                    ...(isDragOver ? styles.tableCellDragOver : {}),
                                  }}
                                  onDragOver={(e) => handleDragOver(e, date, position)}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, date, position)}
                                  onClick={() => {
                                    if (selectedSchedule.status === "DRAFT") {
                                      openModal(date, position);
                                    }
                                  }}
                                >
                                  {assignments.length === 0 ? (
                                    <div style={styles.emptyCell}>
                                      {selectedSchedule.status === "DRAFT" ? "Click to assign" : "—"}
                                    </div>
                                  ) : (
                                    assignments.map((assignment) => (
                                      <div
                                        key={assignment.id}
                                        draggable={selectedSchedule.status === "DRAFT"}
                                        onDragStart={(e) => handleDragStart(e, assignment)}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (selectedSchedule.status === "DRAFT") {
                                            openModal(date, position, assignment);
                                          }
                                        }}
                                        style={{
                                          ...styles.assignmentBadge,
                                          background: assignment.assignedUser
                                            ? "var(--primary-light)"
                                            : "var(--gray-200)",
                                          cursor: selectedSchedule.status === "DRAFT" ? "grab" : "pointer",
                                        }}
                                        onDragEnd={() => {
                                          setDraggedAssignment(null);
                                          setDragOverCell(null);
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
                                    ))
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button style={styles.modalClose} onClick={closeModal}>
              ×
            </button>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {modalAssignment ? "Edit Assignment" : "Create Assignment"}
              </h2>
              {modalDate && (
                <div style={{ color: "var(--gray-600)", fontSize: "var(--font-size-sm)" }}>
                  {new Date(modalDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Position</label>
              <input
                type="text"
                value={modalPosition}
                onChange={(e) => setModalPosition(e.target.value)}
                placeholder="e.g., Cash, Floater, Host"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Employee</label>
              <select
                value={modalEmployeeId}
                onChange={(e) => setModalEmployeeId(e.target.value)}
                style={styles.select}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Start Time</label>
                <input
                  type="time"
                  value={modalStartTime}
                  onChange={(e) => setModalStartTime(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>End Time</label>
                <input
                  type="time"
                  value={modalEndTime}
                  onChange={(e) => setModalEndTime(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.modalButtonGroup}>
              <button
                onClick={handleSaveAssignment}
                style={{
                  ...styles.modalButton,
                  ...styles.modalButtonPrimary,
                  flex: 1,
                }}
              >
                {modalAssignment ? "Update" : "Create"}
              </button>
            </div>

            {modalAssignment && (
              <button
                onClick={handleDeleteAssignment}
                style={{
                  ...styles.modalButton,
                  ...styles.modalButtonDanger,
                  width: "100%",
                }}
              >
                Delete Assignment
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
