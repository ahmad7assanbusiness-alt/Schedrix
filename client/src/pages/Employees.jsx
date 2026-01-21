import { useState, useEffect } from "react";
import { api } from "../api/client.js";
import "../index.css";

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "var(--spacing-xl)",
  },
  title: {
    fontSize: "var(--font-size-3xl)",
    fontWeight: 800,
    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  addButton: {
    padding: "var(--spacing-md) var(--spacing-xl)",
    background: "var(--primary)",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    cursor: "pointer",
  },
  table: {
    width: "100%",
    background: "var(--bg-primary)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    boxShadow: "var(--shadow-sm)",
  },
  tableHeader: {
    background: "var(--gray-100)",
    padding: "var(--spacing-md)",
    borderBottom: "2px solid var(--gray-200)",
    fontWeight: 600,
    color: "var(--text-secondary)",
    textAlign: "left",
  },
  tableCell: {
    padding: "var(--spacing-md)",
    borderBottom: "1px solid var(--gray-200)",
    color: "var(--text-primary)",
  },
  roleBadge: {
    padding: "var(--spacing-xs) var(--spacing-md)",
    borderRadius: "9999px",
    fontSize: "var(--font-size-xs)",
    fontWeight: 600,
    textTransform: "capitalize",
    display: "inline-block",
  },
  roleOwner: {
    background: "var(--primary-light)",
    color: "var(--primary)",
  },
  roleManager: {
    background: "var(--secondary-light)",
    color: "var(--secondary)",
  },
  roleEmployee: {
    background: "var(--gray-100)",
    color: "var(--gray-700)",
  },
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const data = await api.get("/business/employees");
      setEmployees(data);
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Employees</h1>
        <button style={styles.addButton}>+ Add Employee</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Name</th>
            <th style={styles.tableHeader}>Email</th>
            <th style={styles.tableHeader}>Role</th>
            <th style={styles.tableHeader}>Joined</th>
            <th style={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td style={styles.tableCell}>{employee.name}</td>
              <td style={styles.tableCell}>{employee.email || "—"}</td>
              <td style={styles.tableCell}>
                <span
                  style={{
                    ...styles.roleBadge,
                    ...(employee.role === "OWNER"
                      ? styles.roleOwner
                      : employee.role === "MANAGER"
                      ? styles.roleManager
                      : styles.roleEmployee),
                  }}
                >
                  {employee.role.toLowerCase()}
                </span>
              </td>
              <td style={styles.tableCell}>
                {new Date(employee.createdAt).toLocaleDateString()}
              </td>
              <td style={styles.tableCell}>
                <button style={{ fontSize: "var(--font-size-sm)", color: "var(--primary)" }}>
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
