import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../auth/useAuth.js";

export default function Schedule() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [users, setUsers] = useState([]);
  const [openRequest, setOpenRequest] = useState(null);
  const [requestEntries, setRequestEntries] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    loadSchedules();
    loadOpenRequest();
  }, []);

  async function loadSchedules() {
    try {
      const data = await api.get("/schedules");
      setSchedules(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadOpenRequest() {
    try {
      const data = await api.get("/availability-requests/open");
      if (data) {
        setOpenRequest(data);
        const entries = await api.get(`/availability-requests/${data.id}/entries`);
        setRequestEntries(entries);
      }
    } catch (err) {
      // Ignore if no open request
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

  function getAvailableEmployees(date, label) {
    if (!openRequest || requestEntries.length === 0) {
      return users;
    }

    const dateStr = new Date(date).toISOString().split("T")[0];
    const blockKey = label.toLowerCase();
    const availableUserIds = new Set();

    requestEntries.forEach((entry) => {
      const entryDateStr = new Date(entry.date).toISOString().split("T")[0];
      if (entryDateStr === dateStr && entry.blocks[blockKey]) {
        availableUserIds.add(entry.user.id);
      }
    });

    return users.filter((u) => availableUserIds.has(u.id));
  }

  async function assignShift(date, label, userId) {
    try {
      await api.post(`/schedules/${selectedSchedule.id}/assignments`, {
        date: new Date(date).toISOString(),
        label,
        assignedUserId: userId,
      });
      loadSchedule(selectedSchedule.id);
      setSelectedCell(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function unassignShift(date, label) {
    try {
      await api.post(`/schedules/${selectedSchedule.id}/assignments`, {
        date: new Date(date).toISOString(),
        label,
        assignedUserId: null,
      });
      loadSchedule(selectedSchedule.id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function publishSchedule() {
    try {
      await api.post(`/schedules/${selectedSchedule.id}/publish`);
      loadSchedule(selectedSchedule.id);
    } catch (err) {
      setError(err.message);
    }
  }

  function getAssignment(date, label) {
    if (!selectedSchedule) return null;
    return selectedSchedule.assignments.find(
      (a) => new Date(a.date).toISOString().split("T")[0] === new Date(date).toISOString().split("T")[0] && a.label === label
    );
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

  const dates = getDates();
  const labels = ["Morning", "Evening"];

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/dashboard" style={{ textDecoration: "none", color: "#007bff" }}>
          ← Back to Dashboard
        </Link>
      </div>
      <h1>Schedule Builder</h1>

      {error && (
        <div style={{ padding: 10, backgroundColor: "#fee", color: "#c00", borderRadius: 4, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 40 }}>
        <h2>Create New Schedule</h2>
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: 15 }}>
            <label>
              Start Date:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{ width: "100%", padding: 8, marginTop: 5, boxSizing: "border-box" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 15 }}>
            <label>
              End Date:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                style={{ width: "100%", padding: 8, marginTop: 5, boxSizing: "border-box" }}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating..." : "Create Schedule"}
          </button>
        </form>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2>Existing Schedules</h2>
        {schedules.length === 0 ? (
          <p>No schedules yet.</p>
        ) : (
          <div>
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                style={{
                  padding: 15,
                  marginBottom: 10,
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #dee2e6",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
                onClick={() => loadSchedule(schedule.id)}
              >
                <strong>
                  {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}
                </strong>
                <span style={{ marginLeft: 10, color: schedule.status === "PUBLISHED" ? "#28a745" : "#6c757d" }}>
                  ({schedule.status})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSchedule && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2>
              Schedule: {new Date(selectedSchedule.startDate).toLocaleDateString()} -{" "}
              {new Date(selectedSchedule.endDate).toLocaleDateString()} ({selectedSchedule.status})
            </h2>
            {selectedSchedule.status === "DRAFT" && (
              <button
                onClick={publishSchedule}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Publish Schedule
              </button>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{ padding: 10, border: "1px solid #dee2e6" }}>Shift</th>
                  {dates.map((date) => (
                    <th key={date.toISOString()} style={{ padding: 10, border: "1px solid #dee2e6" }}>
                      {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labels.map((label) => (
                  <tr key={label}>
                    <td style={{ padding: 10, border: "1px solid #dee2e6", fontWeight: "bold" }}>{label}</td>
                    {dates.map((date) => {
                      const assignment = getAssignment(date, label);
                      const cellKey = `${date.toISOString()}-${label}`;
                      return (
                        <td
                          key={cellKey}
                          style={{
                            padding: 10,
                            border: "1px solid #dee2e6",
                            backgroundColor: selectedCell === cellKey ? "#fff3cd" : "white",
                            cursor: "pointer",
                            position: "relative",
                          }}
                          onClick={() => setSelectedCell(cellKey)}
                        >
                          {assignment?.assignedUser ? (
                            <div>
                              <div>{assignment.assignedUser.name}</div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  unassignShift(date, label);
                                }}
                                style={{
                                  marginTop: 5,
                                  padding: "4px 8px",
                                  fontSize: 12,
                                  backgroundColor: "#dc3545",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                }}
                              >
                                Unassign
                              </button>
                            </div>
                          ) : (
                            <div style={{ color: "#6c757d" }}>Click to assign</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedCell && (
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                padding: 20,
                border: "2px solid #007bff",
                borderRadius: 8,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                zIndex: 1000,
                minWidth: 300,
              }}
            >
              <h3>Assign Employee</h3>
              {(() => {
                const [dateStr, label] = selectedCell.split("-");
                const date = new Date(dateStr);
                const available = getAvailableEmployees(date, label);
                return (
                  <div>
                    {available.length === 0 ? (
                      <p>No available employees</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {available.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => assignShift(date, label, user.id)}
                            style={{
                              padding: "10px",
                              backgroundColor: "#007bff",
                              color: "white",
                              border: "none",
                              borderRadius: 4,
                              cursor: "pointer",
                            }}
                          >
                            {user.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedCell(null)}
                      style={{
                        marginTop: 15,
                        padding: "8px 16px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

