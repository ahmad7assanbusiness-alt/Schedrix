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
    background: "var(--bg-primary)",
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
  formCard: {
    background: "var(--bg-primary)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-xl)",
    marginBottom: "var(--spacing-xl)",
    boxShadow: "var(--shadow-md)",
  },
  formTitle: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 700,
    color: "var(--text-primary)",
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
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
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
  },
  select: {
    width: "100%",
    padding: "0.875rem 1rem",
    fontSize: "var(--font-size-base)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-md)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
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
    background: "var(--bg-primary)",
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
    color: "var(--text-primary)",
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
    color: "var(--warning-text)",
  },
  statusPublished: {
    backgroundColor: "var(--success-light)",
    color: "var(--success-text)",
  },
  tableContainer: {
    overflowX: "auto",
    marginTop: "var(--spacing-xl)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-lg)",
    background: "var(--bg-primary)",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0",
    minWidth: "800px",
  },
  tableHeader: {
    backgroundColor: "var(--bg-secondary)",
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
    color: "var(--text-secondary)",
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
    color: "var(--text-secondary)",
    backgroundColor: "var(--bg-secondary)",
    position: "sticky",
    left: 0,
    zIndex: 11,
    minWidth: "150px",
  },
  tableRow: {
    transition: "background-color var(--transition-base)",
  },
  tableRowEven: {
    backgroundColor: "var(--bg-primary)",
  },
  tableRowOdd: {
    backgroundColor: "var(--bg-secondary)",
  },
  tableCell: {
    padding: "var(--spacing-md)",
    borderBottom: "1px solid var(--gray-200)",
    borderRight: "1px solid var(--gray-200)",
    verticalAlign: "top",
    minHeight: "60px",
    cursor: "pointer",
    position: "relative",
    backgroundColor: "inherit",
    color: "var(--text-primary)",
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
    color: "var(--text-primary)",
    backgroundColor: "inherit",
    position: "sticky",
    left: 0,
    zIndex: 5,
    minWidth: "150px",
  },
  emptyCell: {
    color: "var(--text-secondary)",
    fontSize: "var(--font-size-sm)",
    textAlign: "center",
    padding: "var(--spacing-sm)",
  },
  assignmentBadge: {
    padding: "var(--spacing-xs) var(--spacing-sm)",
    marginBottom: "var(--spacing-xs)",
    background: "var(--primary-light)",
    color: "var(--primary)",
    borderRadius: "var(--radius-sm)",
    fontSize: "var(--font-size-sm)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
    fontWeight: 500,
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
    background: "var(--bg-primary)",
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
    color: "var(--text-primary)",
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
    color: "var(--text-secondary)",
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
  rowColumnSection: {
    marginTop: "var(--spacing-xl)",
    padding: "var(--spacing-lg)",
    background: "var(--bg-secondary)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--gray-200)",
  },
  rowColumnTitle: {
    fontSize: "var(--font-size-lg)",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-md)",
  },
  rowColumnList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-sm)",
    marginBottom: "var(--spacing-md)",
  },
  rowColumnItem: {
    display: "flex",
    gap: "var(--spacing-sm)",
    alignItems: "center",
  },
  rowColumnInput: {
    flex: 1,
    padding: "var(--spacing-sm) var(--spacing-md)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
  },
  rowColumnDateInput: {
    padding: "var(--spacing-sm) var(--spacing-md)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
    width: "150px",
  },
  addButton: {
    padding: "var(--spacing-sm) var(--spacing-lg)",
    background: "var(--primary)",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all var(--transition-base)",
  },
  removeButton: {
    padding: "var(--spacing-sm)",
    background: "var(--error)",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-sm)",
    cursor: "pointer",
    minWidth: "40px",
  },
  actionButton: {
    padding: "var(--spacing-sm) var(--spacing-md)",
    background: "var(--primary)",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    cursor: "pointer",
    marginRight: "var(--spacing-sm)",
    transition: "all var(--transition-base)",
  },
  actionButtonGroup: {
    display: "flex",
    gap: "var(--spacing-sm)",
    marginBottom: "var(--spacing-lg)",
    flexWrap: "wrap",
  },
  editableCell: {
    padding: "var(--spacing-xs)",
    border: "2px solid var(--primary)",
    borderRadius: "var(--radius-sm)",
    fontSize: "var(--font-size-base)",
    width: "100%",
    minWidth: "100px",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
  },
  positionCell: {
    position: "relative",
    padding: "var(--spacing-md)",
    cursor: "pointer",
  },
  positionCellEditing: {
    padding: "var(--spacing-xs)",
  },
  columnHeaderEditing: {
    padding: "var(--spacing-xs)",
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
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [modalPosition, setModalPosition] = useState("");
  const [modalAssignment, setModalAssignment] = useState(null);
  const [modalEmployeeId, setModalEmployeeId] = useState("");
  const [modalStartTime, setModalStartTime] = useState("09:00");
  const [modalEndTime, setModalEndTime] = useState("17:00");
  const [modalShiftType, setModalShiftType] = useState("morning");
  const [draggedAssignment, setDraggedAssignment] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [editingPosition, setEditingPosition] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editingPositionValue, setEditingPositionValue] = useState("");
  const [editingColumnValue, setEditingColumnValue] = useState({ label: "", date: "" });

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

  async function unpublishSchedule() {
    try {
      if (confirm("Are you sure you want to edit this schedule? It will be hidden from employees until you republish it.")) {
        await api.post(`/schedules/${selectedSchedule.id}/unpublish`);
        loadSchedule(selectedSchedule.id);
        loadSchedules();
        setError(null);
      }
    } catch (err) {
      setError(err.message || "Failed to unpublish schedule");
    }
  }

  async function saveAsTemplate() {
    if (!selectedSchedule) return;
    try {
      const rows = selectedSchedule.rows || null;
      const columns = selectedSchedule.columns || null;
      await api.put("/schedules/template", {
        rows,
        columns,
      });
      setError(null);
      alert("Schedule template saved successfully! New schedules will use this template structure.");
    } catch (err) {
      setError(err.message || "Failed to save template");
    }
  }

  function promptAddColumn() {
    if (!selectedSchedule) return;
    
    // Get unique days from current schedule
    const dayGroups = {};
    dates.forEach((dateObj) => {
      const dayKey = dateObj.date ? dateObj.date.toISOString().split("T")[0] : dateObj.dayIndex;
      if (!dayGroups[dayKey]) {
        dayGroups[dayKey] = {
          date: dateObj.date,
          label: dateObj.label,
        };
      }
    });
    const uniqueDays = Object.values(dayGroups);
    
    if (uniqueDays.length === 0) {
      setError("No days in schedule to add column to");
      return;
    }
    
    // Show prompt to select day
    const dayOptions = uniqueDays.map((day, idx) => 
      `${idx + 1}. ${day.label || (day.date ? new Date(day.date).toLocaleDateString() : `Day ${idx + 1}`)}`
    ).join("\n");
    
    const dayChoice = prompt(
      `Which day do you want to add a column to?\n\n${dayOptions}\n\nEnter the number (1-${uniqueDays.length}):`
    );
    
    const dayIndex = parseInt(dayChoice) - 1;
    if (isNaN(dayIndex) || dayIndex < 0 || dayIndex >= uniqueDays.length) {
      return; // User cancelled or invalid input
    }
    
    const selectedDay = uniqueDays[dayIndex];
    addColumnToDay(selectedDay);
  }

  async function addColumnToDay(day) {
    if (!selectedSchedule) return;
    try {
      const currentColumns = selectedSchedule.columns && Array.isArray(selectedSchedule.columns)
        ? [...selectedSchedule.columns]
        : dates
            .filter(d => {
              const dayKey = d.date ? d.date.toISOString().split("T")[0] : d.dayIndex;
              const targetKey = day.date ? day.date.toISOString().split("T")[0] : day.dayIndex;
              return dayKey === targetKey;
            })
            .map(d => ({ label: d.label, date: d.date ? d.date.toISOString() : undefined }))
            .filter((v, i, a) => a.findIndex(t => t.date === v.date) === i); // Remove duplicates
      
      // Find where to insert the new column (after the selected day's columns)
      const dayDateStr = day.date ? new Date(day.date).toISOString().split("T")[0] : null;
      let insertIndex = currentColumns.length;
      
      if (dayDateStr) {
        // Find the last column for this day
        for (let i = currentColumns.length - 1; i >= 0; i--) {
          if (currentColumns[i].date && new Date(currentColumns[i].date).toISOString().split("T")[0] === dayDateStr) {
            insertIndex = i + 1;
            break;
          }
        }
      }
      
      // Add new column (for overnight shift - will create morning/evening automatically)
      const newColumn = { 
        label: day.label || (day.date ? new Date(day.date).toLocaleDateString() : "New Column"), 
        date: day.date ? new Date(day.date).toISOString() : undefined 
      };
      currentColumns.splice(insertIndex, 0, newColumn);
      
      await api.put(`/schedules/${selectedSchedule.id}/structure`, {
        columns: currentColumns,
      });
      loadSchedule(selectedSchedule.id);
    } catch (err) {
      setError(err.message || "Failed to add column");
    }
  }

  async function addRow() {
    if (!selectedSchedule) return;
    try {
      const currentRows = selectedSchedule.rows && Array.isArray(selectedSchedule.rows)
        ? [...selectedSchedule.rows]
        : [...positions];
      
      const newRow = `Position ${currentRows.length + 1}`;
      const updatedRows = [...currentRows, newRow];
      
      await api.put(`/schedules/${selectedSchedule.id}/structure`, {
        rows: updatedRows,
      });
      loadSchedule(selectedSchedule.id);
    } catch (err) {
      setError(err.message || "Failed to add row");
    }
  }

  async function updateScheduleStructure(rows, columns) {
    if (!selectedSchedule) return;
    try {
      await api.put(`/schedules/${selectedSchedule.id}/structure`, {
        rows: rows !== undefined ? rows : selectedSchedule.rows,
        columns: columns !== undefined ? columns : selectedSchedule.columns,
      });
      loadSchedule(selectedSchedule.id);
    } catch (err) {
      setError(err.message || "Failed to update schedule structure");
    }
  }

  function startEditingPosition(position, index) {
    setEditingPosition(index);
    setEditingPositionValue(position);
  }

  async function savePositionEdit() {
    if (editingPosition === null) return;
    try {
      const currentRows = selectedSchedule.rows && Array.isArray(selectedSchedule.rows)
        ? [...selectedSchedule.rows]
        : [...positions];
      
      if (editingPositionValue.trim() === "") {
        setError("Position name cannot be empty");
        return;
      }
      
      currentRows[editingPosition] = editingPositionValue.trim();
      await updateScheduleStructure(currentRows, undefined);
      setEditingPosition(null);
      setEditingPositionValue("");
    } catch (err) {
      setError(err.message || "Failed to update position");
    }
  }

  function startEditingColumn(column, index) {
    setEditingColumn(index);
    setEditingColumnValue({
      label: column.label || "",
      date: column.date ? new Date(column.date).toISOString().split("T")[0] : "",
    });
  }

  async function saveColumnEdit() {
    if (editingColumn === null) return;
    try {
      const currentColumns = selectedSchedule.columns && Array.isArray(selectedSchedule.columns)
        ? [...selectedSchedule.columns]
        : dates.map(d => ({ label: d.label, date: d.date ? d.date.toISOString() : undefined }));
      
      if (editingColumnValue.label.trim() === "") {
        setError("Column label cannot be empty");
        return;
      }
      
      currentColumns[editingColumn] = {
        label: editingColumnValue.label.trim(),
        date: editingColumnValue.date ? new Date(editingColumnValue.date).toISOString() : undefined,
      };
      
      await updateScheduleStructure(undefined, currentColumns);
      setEditingColumn(null);
      setEditingColumnValue({ label: "", date: "" });
    } catch (err) {
      setError(err.message || "Failed to update column");
    }
  }

  async function deleteRow(index) {
    if (!selectedSchedule) return;
    if (!confirm("Are you sure you want to delete this position? All assignments in this row will be deleted.")) return;
    
    try {
      const currentRows = selectedSchedule.rows && Array.isArray(selectedSchedule.rows)
        ? [...selectedSchedule.rows]
        : [...positions];
      
      const positionToDelete = currentRows[index];
      currentRows.splice(index, 1);
      
      // Delete all assignments for this position
      if (selectedSchedule.assignments) {
        const assignmentsToDelete = selectedSchedule.assignments.filter(
          a => a.position === positionToDelete
        );
        for (const assignment of assignmentsToDelete) {
          await api.delete(`/schedules/${selectedSchedule.id}/assignments/${assignment.id}`);
        }
      }
      
      await updateScheduleStructure(currentRows, undefined);
      loadSchedule(selectedSchedule.id);
    } catch (err) {
      setError(err.message || "Failed to delete row");
    }
  }

  async function deleteColumn(index) {
    if (!selectedSchedule) return;
    if (!confirm("Are you sure you want to delete this column? All assignments in this column will be deleted.")) return;
    
    try {
      const currentColumns = selectedSchedule.columns && Array.isArray(selectedSchedule.columns)
        ? [...selectedSchedule.columns]
        : dates.map(d => ({ label: d.label, date: d.date ? d.date.toISOString() : undefined }));
      
      const columnToDelete = currentColumns[index];
      currentColumns.splice(index, 1);
      
      // Delete all assignments for this column
      if (selectedSchedule.assignments && columnToDelete.date) {
        const targetDate = new Date(columnToDelete.date).toISOString().split("T")[0];
        const assignmentsToDelete = selectedSchedule.assignments.filter(a => {
          const assignmentDate = new Date(a.date).toISOString().split("T")[0];
          return assignmentDate === targetDate;
        });
        for (const assignment of assignmentsToDelete) {
          await api.delete(`/schedules/${selectedSchedule.id}/assignments/${assignment.id}`);
        }
      }
      
      await updateScheduleStructure(undefined, currentColumns);
      loadSchedule(selectedSchedule.id);
    } catch (err) {
      setError(err.message || "Failed to delete column");
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
        dayIndex: dates.length / 2,
      });
      
      // Add evening shift column
      dates.push({
        label: dayLabel,
        date: dayDate,
        index: dates.length,
        shiftType: "evening",
        dayIndex: dates.length / 2,
      });
    }
    return dates;
  }

  function getAssignmentsForDateAndPosition(dateObj, position) {
    if (!selectedSchedule || !selectedSchedule.assignments) return [];
    
    // Handle both date objects and column objects
    const date = dateObj?.date || dateObj;
    if (!date) return [];
    
    const dateStr = new Date(date).toISOString().split("T")[0];
    const shiftType = dateObj.shiftType || "morning";
    
    return selectedSchedule.assignments.filter(
      (a) =>
        new Date(a.date).toISOString().split("T")[0] === dateStr &&
        a.position === position &&
        (a.shiftType || "morning") === shiftType
    );
  }

  function getUniquePositions() {
    if (!selectedSchedule) return [];
    
    // If custom rows are defined, use them
    if (selectedSchedule.rows && Array.isArray(selectedSchedule.rows) && selectedSchedule.rows.length > 0) {
      return selectedSchedule.rows;
    }
    
    // Otherwise, extract positions from assignments (backward compatibility)
    if (!selectedSchedule.assignments) return [];
    const positions = new Set();
    selectedSchedule.assignments.forEach((a) => {
      if (a.position) {
        positions.add(a.position);
      }
    });
    return Array.from(positions).sort();
  }

  async function loadAvailableEmployees(date, shiftType) {
    if (!date) return;
    try {
      // Ensure date is properly formatted as YYYY-MM-DD
      const dateObj = new Date(date);
      const dateStr = dateObj.toISOString().split("T")[0];
      const available = await api.get(
        `/schedules/${selectedSchedule.id}/available-employees?date=${dateStr}&shiftType=${shiftType}`
      );
      setAvailableEmployees(available);
    } catch (err) {
      console.error("Failed to load available employees:", err);
      // Fallback to all users if availability check fails
      setAvailableEmployees(users);
    }
  }

  async function openModal(dateObj, position, assignment = null) {
    // Extract date from date object if it exists
    const date = dateObj?.date || dateObj;
    if (!date && !dateObj) {
      setError("Cannot create assignment: column must have a date");
      return;
    }
    setModalDate(date);
    setModalPosition(position || "");
    setModalAssignment(assignment);
    const shiftType = dateObj?.shiftType || assignment?.shiftType || "morning";
    setModalShiftType(shiftType);
    
    if (assignment) {
      setModalEmployeeId(assignment.assignedUserId || "");
      setModalStartTime(assignment.startTime || "09:00");
      setModalEndTime(assignment.endTime || "17:00");
      // Load available employees even when editing (so we filter correctly)
      await loadAvailableEmployees(date, assignment.shiftType || shiftType);
    } else {
      setModalEmployeeId("");
      // Set default times based on shift type
      if (shiftType === "morning") {
        setModalStartTime("09:00");
        setModalEndTime("17:00");
      } else {
        setModalStartTime("17:00");
        setModalEndTime("21:00");
      }
      // Load only available employees for this date/shift
      await loadAvailableEmployees(date, shiftType);
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
    setModalShiftType("morning");
  }

  async function handleSaveAssignment() {
    if (!modalDate) {
      setError("Date is required. Please ensure the column has a date.");
      return;
    }
    if (!modalPosition || modalPosition.trim() === "") {
      setError("Position is required");
      return;
    }
    try {
      // If position doesn't exist in the schedule, add it to rows
      const currentRows = selectedSchedule.rows && Array.isArray(selectedSchedule.rows)
        ? [...selectedSchedule.rows]
        : [...positions];
      
      if (!currentRows.includes(modalPosition.trim())) {
        currentRows.push(modalPosition.trim());
        await updateScheduleStructure(currentRows, undefined);
      }

      if (modalAssignment) {
        // Update existing assignment
        await api.put(
          `/schedules/${selectedSchedule.id}/assignments/${modalAssignment.id}`,
          {
            position: modalPosition.trim(),
            assignedUserId: modalEmployeeId || null,
            startTime: modalStartTime,
            endTime: modalEndTime,
            shiftType: modalShiftType,
          }
        );
      } else {
        // Create new assignment
        await api.post(`/schedules/${selectedSchedule.id}/assignments`, {
          date: new Date(modalDate).toISOString(),
          position: modalPosition.trim(),
          assignedUserId: modalEmployeeId || null,
          startTime: modalStartTime,
          endTime: modalEndTime,
          shiftType: modalShiftType,
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
    setDraggedAssignment(assignment);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", assignment.id);
  }

  function handleDragOver(e, dateObj, position) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const date = dateObj?.date || dateObj;
    const dateKey = date ? date.toISOString() : `col-${dateObj.index || 0}`;
    setDragOverCell({ dateKey, position, dateObj });
  }

  function handleDragLeave(e) {
    setDragOverCell(null);
  }

  async function handleDrop(e, targetDateObj, targetPosition) {
    e.preventDefault();
    setDragOverCell(null);
    
    if (!draggedAssignment) return;
    
    // Get the actual date from the date object
    const targetDate = targetDateObj?.date || targetDateObj;
    if (!targetDate) {
      setError("Cannot drop assignment on a column without a date");
      setDraggedAssignment(null);
      return;
    }
    
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
            date: new Date(targetDate).toISOString(),
          }
        );
        // Reload schedule to get updated data
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
                <div style={{ textAlign: "center", padding: "var(--spacing-xl)", color: "var(--text-secondary)" }}>
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
                <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
                  {selectedSchedule.status === "DRAFT" && (
                    <button onClick={publishSchedule} style={styles.publishButton}>
                      Publish Schedule
                    </button>
                  )}
                  {selectedSchedule.status === "PUBLISHED" && (
                    <button 
                      onClick={unpublishSchedule} 
                      style={{
                        ...styles.publishButton,
                        background: "var(--warning)",
                        color: "white",
                      }}
                    >
                      Edit Schedule
                    </button>
                  )}
                </div>
              </div>

              <div style={styles.actionButtonGroup}>
                <button onClick={addRow} style={styles.actionButton}>
                  + Add Row (Position)
                </button>
                <button onClick={promptAddColumn} style={styles.actionButton}>
                  + Add Column (Overnight Shift)
                </button>
                <button 
                  onClick={saveAsTemplate}
                  style={{ ...styles.actionButton, background: "var(--secondary)" }}
                  title="Save current schedule structure (rows and columns) as template for future schedules"
                >
                  Save as Template
                </button>
                {selectedSchedule.status === "DRAFT" && (
                  <button 
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this draft schedule? This cannot be undone.")) {
                        try {
                          await api.delete(`/schedules/${selectedSchedule.id}`);
                          setSelectedSchedule(null);
                          loadSchedules();
                        } catch (err) {
                          setError(err.message || "Failed to delete schedule");
                        }
                      }
                    }}
                    style={{ ...styles.actionButton, background: "var(--error)" }}
                  >
                    Delete Schedule
                  </button>
                )}
              </div>

              {dates.length > 0 ? (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th rowSpan={2} style={styles.tableHeaderCellFirst}>
                          Position
                          {positions.length === 0 && (
                            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginTop: "var(--spacing-xs)" }}>
                              Click "+ Add Row" to start
                            </div>
                          )}
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
                            {editingColumn === idx ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)" }}>
                                <input
                                  type="text"
                                  value={editingColumnValue.label}
                                  onChange={(e) => setEditingColumnValue({ ...editingColumnValue, label: e.target.value })}
                                  placeholder="Column label"
                                  style={styles.editableCell}
                                  autoFocus
                                  onBlur={saveColumnEdit}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveColumnEdit();
                                    if (e.key === "Escape") {
                                      setEditingColumn(null);
                                      setEditingColumnValue({ label: "", date: "" });
                                    }
                                  }}
                                />
                                <input
                                  type="date"
                                  value={editingColumnValue.date}
                                  onChange={(e) => setEditingColumnValue({ ...editingColumnValue, date: e.target.value })}
                                  placeholder="Date (optional)"
                                  style={{ ...styles.editableCell, fontSize: "var(--font-size-xs)" }}
                                />
                                {dates.length > 1 && (
                                  <button
                                    onClick={() => deleteColumn(idx)}
                                    style={{ ...styles.removeButton, fontSize: "var(--font-size-xs)", padding: "2px 6px" }}
                                    title="Delete column"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-xs)" }}
                              >
                                <span
                                  style={{ flex: 1, textAlign: "center", fontSize: "var(--font-size-xs)", fontWeight: 600 }}
                                >
                                  {dateObj.shiftType === "morning" ? "Morning" : "Evening"}
                                </span>
                                {dates.length > 1 && (
                                  <button
                                    onClick={() => deleteColumn(idx)}
                                    style={{ ...styles.removeButton, fontSize: "var(--font-size-xs)", padding: "2px 6px" }}
                                    title="Delete column"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {positions.length === 0 ? (
                        <tr>
                          <td style={styles.tableCellFirst}>
                            <div style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-sm)", textAlign: "center" }}>
                              Click "+ Add Row" above
                            </div>
                          </td>
                          {dates.map((dateObj, dateIdx) => {
                            const date = dateObj.date || dateObj;
                            const dateKey = date ? date.toISOString() : `col-${dateIdx}`;
                            return (
                              <td
                                key={dateKey}
                                style={styles.tableCell}
                                onClick={() => {
                                  // Create a temporary position name for the modal
                                  openModal(dateObj, "");
                                }}
                              >
                                <div style={styles.emptyCell}>
                                  Click to create assignment
                                </div>
                              </td>
                            );
                          })}
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
                            <td style={styles.tableCellFirst}>
                              {editingPosition === rowIndex ? (
                                <input
                                  type="text"
                                  value={editingPositionValue}
                                  onChange={(e) => setEditingPositionValue(e.target.value)}
                                  style={styles.editableCell}
                                  autoFocus
                                  onBlur={savePositionEdit}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") savePositionEdit();
                                    if (e.key === "Escape") {
                                      setEditingPosition(null);
                                      setEditingPositionValue("");
                                    }
                                  }}
                                />
                              ) : (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-xs)" }}>
                                  <span
                                    onClick={() => startEditingPosition(position, rowIndex)}
                                    style={{ cursor: "pointer", flex: 1 }}
                                    title="Click to edit"
                                  >
                                    {position}
                                  </span>
                                  {positions.length > 1 && (
                                    <button
                                      onClick={() => deleteRow(rowIndex)}
                                      style={{ ...styles.removeButton, fontSize: "var(--font-size-xs)", padding: "2px 6px" }}
                                      title="Delete row"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            {dates.map((dateObj, dateIdx) => {
                              const date = dateObj.date || dateObj;
                              const assignments = getAssignmentsForDateAndPosition(
                                dateObj,
                                position
                              );
                              const dateKey = date ? date.toISOString() : `col-${dateIdx}`;
                              const isDragOver = dragOverCell?.dateKey === dateKey && dragOverCell?.position === position;
                              return (
                                <td
                                  key={dateKey}
                                  style={{
                                    ...styles.tableCell,
                                    ...(isDragOver ? styles.tableCellDragOver : {}),
                                  }}
                                  onDragOver={(e) => handleDragOver(e, dateObj, position)}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, dateObj, position)}
                                  onClick={() => {
                                    openModal(dateObj, position);
                                  }}
                                >
                                  {assignments.length === 0 ? (
                                    <div style={styles.emptyCell}>
                                      Click to assign
                                    </div>
                                  ) : (
                                    assignments.map((assignment) => (
                                      <div
                                        key={assignment.id}
                                        draggable={true}
                                        onDragStart={(e) => handleDragStart(e, assignment)}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openModal(dateObj, position, assignment);
                                        }}
                                        style={{
                                          ...styles.assignmentBadge,
                                          background: assignment.assignedUser
                                            ? "var(--primary-light)"
                                            : "var(--gray-200)",
                                          color: assignment.assignedUser
                                            ? "var(--primary)"
                                            : "var(--text-primary)",
                                          cursor: "grab",
                                        }}
                                        onDragEnd={() => {
                                          setDraggedAssignment(null);
                                          setDragOverCell(null);
                                        }}
                                      >
                                        <div style={{ fontWeight: 600, color: "inherit" }}>
                                          {assignment.assignedUser?.name || "Unassigned"}
                                        </div>
                                        {assignment.startTime && assignment.endTime && (
                                          <div
                                            style={{
                                              fontSize: "var(--font-size-xs)",
                                              color: assignment.assignedUser
                                                ? "var(--primary-dark)"
                                                : "var(--text-secondary)",
                                              opacity: 0.9,
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
                <div style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-sm)" }}>
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
              <label style={styles.label}>Shift Type</label>
              <select
                value={modalShiftType}
                onChange={async (e) => {
                  const newShiftType = e.target.value;
                  setModalShiftType(newShiftType);
                  // Update default times based on shift type
                  if (newShiftType === "morning") {
                    setModalStartTime("09:00");
                    setModalEndTime("17:00");
                  } else {
                    setModalStartTime("17:00");
                    setModalEndTime("21:00");
                  }
                  // Reload available employees for the new shift type
                  if (modalDate) {
                    await loadAvailableEmployees(modalDate, newShiftType);
                    // Clear selected employee if they're not available for new shift
                    setModalEmployeeId("");
                  }
                }}
                style={styles.select}
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Employee</label>
              <select
                value={modalEmployeeId}
                onChange={(e) => setModalEmployeeId(e.target.value)}
                style={styles.select}
              >
                <option value="">Unassigned</option>
                {availableEmployees.length > 0 ? (
                  availableEmployees.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))
                ) : (
                  users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))
                )}
              </select>
              {availableEmployees.length === 0 && modalAssignment === null && (
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginTop: "var(--spacing-xs)" }}>
                  No employees available for this shift. Showing all employees.
                </p>
              )}
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
