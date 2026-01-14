import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

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
      newEntries[dateKey] = { morning: false, evening: false };
    }
    setEntries(newEntries);
  }

  function toggleAvailability(dateKey, block) {
    setEntries((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [block]: !prev[dateKey][block],
      },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const entriesArray = Object.entries(entries).map(([dateKey, blocks]) => ({
        date: new Date(dateKey).toISOString(),
        morning: blocks.morning,
        evening: blocks.evening,
      }));

      await api.post("/availability-entries", {
        requestId: request.id,
        entries: entriesArray,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!request) {
    return (
      <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <Link to="/dashboard" style={{ textDecoration: "none", color: "#007bff" }}>
            ← Back to Dashboard
          </Link>
        </div>
        <h1>Submit Availability</h1>
        {error && (
          <div style={{ padding: 10, backgroundColor: "#fee", color: "#c00", borderRadius: 4 }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  const dates = Object.keys(entries).sort();

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/dashboard" style={{ textDecoration: "none", color: "#007bff" }}>
          ← Back to Dashboard
        </Link>
      </div>
      <h1>Submit Availability</h1>
      <p>
        Period: {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
      </p>

      {error && (
        <div style={{ padding: 10, backgroundColor: "#fee", color: "#c00", borderRadius: 4, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          {dates.map((dateKey) => (
            <div
              key={dateKey}
              style={{
                padding: 15,
                marginBottom: 10,
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: 4,
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: 10 }}>
                {new Date(dateKey).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={entries[dateKey].morning}
                    onChange={() => toggleAvailability(dateKey, "morning")}
                    style={{ marginRight: 5 }}
                  />
                  Morning
                </label>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={entries[dateKey].evening}
                    onChange={() => toggleAvailability(dateKey, "evening")}
                    style={{ marginRight: 5 }}
                  />
                  Evening
                </label>
              </div>
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Submitting..." : "Submit Availability"}
        </button>
      </form>
    </div>
  );
}

