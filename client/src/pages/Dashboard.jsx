import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";

export default function Dashboard() {
  const { user, business, logout } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const isManager = user.role === "OWNER" || user.role === "MANAGER";
  const isEmployee = user.role === "EMPLOYEE";

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome, {user.name}! ({user.role})
          </p>
          {business && (
            <p>
              Business: {business.name} {isManager && `(Join Code: ${business.joinCode})`}
            </p>
          )}
        </div>
        <button
          onClick={logout}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {isManager && (
        <div>
          <h2>Manager Tools</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link
              to="/availability/request"
              style={{
                padding: 15,
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: 4,
                textDecoration: "none",
                color: "#333",
              }}
            >
              Availability Requests
            </Link>
            <Link
              to="/schedule"
              style={{
                padding: 15,
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: 4,
                textDecoration: "none",
                color: "#333",
              }}
            >
              Schedule Builder
            </Link>
          </div>
        </div>
      )}

      {isEmployee && (
        <div>
          <h2>Employee Tools</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link
              to="/availability/submit"
              style={{
                padding: 15,
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: 4,
                textDecoration: "none",
                color: "#333",
              }}
            >
              Submit Availability
            </Link>
            <Link
              to="/schedule/my"
              style={{
                padding: 15,
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: 4,
                textDecoration: "none",
                color: "#333",
              }}
            >
              My Schedule
            </Link>
            <Link
              to="/schedule/full"
              style={{
                padding: 15,
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: 4,
                textDecoration: "none",
                color: "#333",
              }}
            >
              Full Schedule
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

