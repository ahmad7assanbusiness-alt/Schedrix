import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../auth/useAuth.js";

export default function ScheduleMy() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  function getMyAssignments() {
    if (!selectedSchedule) return [];
    return selectedSchedule.assignments.filter((a) => a.assignedUserId === user?.id);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  const myAssignments = getMyAssignments();

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/dashboard" style={{ textDecoration: "none", color: "#007bff" }}>
          ← Back to Dashboard
        </Link>
      </div>
      <h1>My Schedule</h1>

      {error && (
        <div style={{ padding: 10, backgroundColor: "#fee", color: "#c00", borderRadius: 4, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {schedules.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <label>
            Select Schedule:
            <select
              onChange={(e) => loadSchedule(e.target.value)}
              style={{ marginLeft: 10, padding: 8 }}
            >
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {selectedSchedule && (
        <div>
          <h2>
            {new Date(selectedSchedule.startDate).toLocaleDateString()} -{" "}
            {new Date(selectedSchedule.endDate).toLocaleDateString()}
          </h2>
          {myAssignments.length === 0 ? (
            <p>You have no assigned shifts for this period.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{ padding: 10, border: "1px solid #dee2e6" }}>Date</th>
                  <th style={{ padding: 10, border: "1px solid #dee2e6" }}>Shift</th>
                  <th style={{ padding: 10, border: "1px solid #dee2e6" }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {myAssignments
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((assignment) => (
                    <tr key={assignment.id}>
                      <td style={{ padding: 10, border: "1px solid #dee2e6" }}>
                        {new Date(assignment.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td style={{ padding: 10, border: "1px solid #dee2e6" }}>{assignment.label}</td>
                      <td style={{ padding: 10, border: "1px solid #dee2e6" }}>
                        {assignment.startTime} - {assignment.endTime}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {schedules.length === 0 && (
        <p>No published schedules available.</p>
      )}
    </div>
  );
}

