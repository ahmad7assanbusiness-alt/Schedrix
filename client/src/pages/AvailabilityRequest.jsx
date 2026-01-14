import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";

export default function AvailabilityRequest() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    try {
      await api.post("/availability-requests", {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      setStartDate("");
      setEndDate("");
      loadRequests();
    } catch (err) {
      setError(err.message);
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
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/dashboard" style={{ textDecoration: "none", color: "#007bff" }}>
          ← Back to Dashboard
        </Link>
      </div>
      <h1>Availability Requests</h1>

      {error && (
        <div style={{ padding: 10, backgroundColor: "#fee", color: "#c00", borderRadius: 4, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 40 }}>
        <h2>Create New Request</h2>
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
            {loading ? "Creating..." : "Create Request"}
          </button>
        </form>
      </div>

      <div>
        <h2>Existing Requests</h2>
        {requests.length === 0 ? (
          <p>No requests yet.</p>
        ) : (
          <div>
            {requests.map((req) => (
              <div
                key={req.id}
                style={{
                  padding: 15,
                  marginBottom: 10,
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #dee2e6",
                  borderRadius: 4,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>
                      {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                    </strong>
                    <span style={{ marginLeft: 10, color: req.status === "OPEN" ? "#28a745" : "#6c757d" }}>
                      ({req.status})
                    </span>
                  </div>
                  <button
                    onClick={() => loadEntries(req.id)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#17a2b8",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
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
        <div style={{ marginTop: 40 }}>
          <h2>Availability Entries</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={{ padding: 10, border: "1px solid #dee2e6" }}>Date</th>
                <th style={{ padding: 10, border: "1px solid #dee2e6" }}>Employee</th>
                <th style={{ padding: 10, border: "1px solid #dee2e6" }}>Morning</th>
                <th style={{ padding: 10, border: "1px solid #dee2e6" }}>Evening</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td style={{ padding: 10, border: "1px solid #dee2e6" }}>
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: 10, border: "1px solid #dee2e6" }}>{entry.user.name}</td>
                  <td style={{ padding: 10, border: "1px solid #dee2e6" }}>
                    {entry.blocks.morning ? "✓" : "✗"}
                  </td>
                  <td style={{ padding: 10, border: "1px solid #dee2e6" }}>
                    {entry.blocks.evening ? "✓" : "✗"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

