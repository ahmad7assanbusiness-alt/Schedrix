import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../auth/useAuth.js";

export default function Welcome() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState("owner"); // "owner" or "employee"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [employeeName, setEmployeeName] = useState("");

  async function handleBootstrap(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user, business } = await api.post("/auth/bootstrap-owner", {
        businessName,
        ownerName,
      });
      login(token, user, business);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user, business } = await api.post("/auth/join", {
        joinCode: joinCode.toUpperCase(),
        employeeName,
      });
      login(token, user, business);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}>
      <h1>ScheduleManager</h1>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setMode("owner")}
          style={{
            marginRight: 10,
            padding: "10px 20px",
            backgroundColor: mode === "owner" ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Create Business (Owner)
        </button>
        <button
          onClick={() => setMode("employee")}
          style={{
            padding: "10px 20px",
            backgroundColor: mode === "employee" ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Join Business (Employee)
        </button>
      </div>

      {error && (
        <div style={{ padding: 10, backgroundColor: "#fee", color: "#c00", borderRadius: 4, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {mode === "owner" ? (
        <form onSubmit={handleBootstrap}>
          <div style={{ marginBottom: 15 }}>
            <label>
              Business Name:
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                style={{ width: "100%", padding: 8, marginTop: 5, boxSizing: "border-box" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 15 }}>
            <label>
              Owner Name:
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
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
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating..." : "Create Business"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin}>
          <div style={{ marginBottom: 15 }}>
            <label>
              Join Code:
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                required
                style={{ width: "100%", padding: 8, marginTop: 5, boxSizing: "border-box" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 15 }}>
            <label>
              Employee Name:
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
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
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Joining..." : "Join Business"}
          </button>
        </form>
      )}
    </div>
  );
}

