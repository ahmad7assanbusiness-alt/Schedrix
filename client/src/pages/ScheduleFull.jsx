import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../auth/useAuth.js";

export default function ScheduleFull() {
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

  function getAssignmentsForDate(date) {
    if (!selectedSchedule) return [];
    const dateStr = new Date(date).toISOString().split("T")[0];
    return selectedSchedule.assignments.filter(
      (a) => new Date(a.date).toISOString().split("T")[0] === dateStr && a.assignedUser
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  // Determine correct dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return "/dashboard";
    const isManager = user.role === "OWNER" || user.role === "MANAGER";
    return isManager ? "/dashboard" : "/employee/dashboard";
  };

  const dates = getDates();

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 20, color: "var(--text-primary)" }}>
      <div style={{ marginBottom: 20 }}>
        <Link to={getDashboardPath()} style={{ textDecoration: "none", color: "var(--primary)" }}>
          ← Back to Dashboard
        </Link>
      </div>
      <h1>Full Schedule</h1>

      {error && (
        <div style={{ padding: 10, backgroundColor: "var(--error-light)", color: "var(--error-text)", borderRadius: 4, marginBottom: 20 }}>
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
          {dates.map((date) => {
            const assignments = getAssignmentsForDate(date);
            return (
              <div
                key={date.toISOString()}
                style={{
                  padding: 15,
                  marginBottom: 15,
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--gray-200)",
                  borderRadius: 4,
                }}
              >
                <h3 style={{ marginTop: 0, color: "var(--text-primary)" }}>
                  {date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </h3>
                {assignments.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>No assignments</p>
                ) : (
                  <div>
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        style={{
                          padding: 10,
                          marginBottom: 5,
                          backgroundColor: "var(--bg-primary)",
                          border: "1px solid var(--gray-200)",
                          borderRadius: 4,
                          color: "var(--text-primary)",
                        }}
                      >
                        <strong>{assignment.label}</strong>: {assignment.assignedUser?.name} (
                        {assignment.startTime} - {assignment.endTime})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {schedules.length === 0 && <p>No published schedules available.</p>}
    </div>
  );
}

