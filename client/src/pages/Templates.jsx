import { useState, useEffect } from "react";
import { api } from "../api/client.js";
import "../index.css";

const styles = {
  container: {
    maxWidth: "1400px",
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
  createButton: {
    padding: "var(--spacing-md) var(--spacing-xl)",
    background: "var(--primary)",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    cursor: "pointer",
  },
  templatesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "var(--spacing-lg)",
  },
  templateCard: {
    background: "var(--bg-primary)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-xl)",
    boxShadow: "var(--shadow-sm)",
    transition: "all var(--transition-base)",
  },
  templateCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "var(--spacing-md)",
  },
  templateName: {
    fontSize: "var(--font-size-xl)",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-xs)",
  },
  templateActions: {
    display: "flex",
    gap: "var(--spacing-sm)",
  },
  actionButton: {
    padding: "var(--spacing-xs) var(--spacing-sm)",
    background: "transparent",
    border: "1px solid var(--gray-300)",
    borderRadius: "var(--radius-sm)",
    fontSize: "var(--font-size-xs)",
    cursor: "pointer",
    color: "var(--text-secondary)",
  },
  templateInfo: {
    fontSize: "var(--font-size-sm)",
    color: "var(--text-secondary)",
    marginBottom: "var(--spacing-md)",
  },
  assignedEmployees: {
    marginTop: "var(--spacing-md)",
    paddingTop: "var(--spacing-md)",
    borderTop: "1px solid var(--gray-200)",
  },
  assignedEmployeesTitle: {
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: "var(--spacing-sm)",
  },
  employeeList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--spacing-xs)",
  },
  employeeTag: {
    padding: "var(--spacing-xs) var(--spacing-sm)",
    background: "var(--bg-secondary)",
    borderRadius: "var(--radius-sm)",
    fontSize: "var(--font-size-xs)",
    color: "var(--text-secondary)",
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
    maxWidth: "600px",
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
  },
  formGroup: {
    marginBottom: "var(--spacing-lg)",
  },
  label: {
    display: "block",
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: "var(--spacing-sm)",
  },
  input: {
    width: "100%",
    padding: "var(--spacing-md)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
  },
  checkboxList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-sm)",
    maxHeight: "300px",
    overflowY: "auto",
    padding: "var(--spacing-md)",
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-md)",
  },
  checkboxItem: {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-sm)",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  modalButtons: {
    display: "flex",
    gap: "var(--spacing-md)",
    justifyContent: "flex-end",
    marginTop: "var(--spacing-xl)",
  },
  button: {
    padding: "var(--spacing-md) var(--spacing-xl)",
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    border: "none",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "all var(--transition-base)",
  },
  buttonPrimary: {
    background: "var(--primary)",
    color: "white",
  },
  buttonSecondary: {
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    border: "1px solid var(--gray-300)",
  },
  error: {
    padding: "var(--spacing-md)",
    background: "var(--error-light)",
    color: "var(--error-text)",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--spacing-lg)",
  },
};

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  useEffect(() => {
    loadTemplates();
    loadEmployees();
  }, []);

  async function loadTemplates() {
    try {
      const data = await api.get("/templates");
      setTemplates(data);
    } catch (err) {
      setError(err.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  }

  async function loadEmployees() {
    try {
      const data = await api.get("/business/employees");
      setEmployees(data.filter(e => e.role === "EMPLOYEE"));
    } catch (err) {
      console.error("Failed to load employees:", err);
    }
  }

  function openCreateModal() {
    setEditingTemplate(null);
    setTemplateName("");
    setSelectedEmployees([]);
    setModalOpen(true);
  }

  function openEditModal(template) {
    setEditingTemplate(template);
    setTemplateName(template.name || "");
    setSelectedEmployees(
      template.assignedEmployees?.map(ae => ae.user.id) || []
    );
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTemplate(null);
    setTemplateName("");
    setSelectedEmployees([]);
    setError(null);
  }

  function toggleEmployee(employeeId) {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  }

  async function handleSave() {
    if (!templateName.trim()) {
      setError("Template name is required");
      return;
    }

    try {
      setError(null);
      if (editingTemplate) {
        // Update template
        await api.put(`/templates/${editingTemplate.id}`, {
          name: templateName,
        });
        // Update employee assignments
        await api.post(`/templates/${editingTemplate.id}/assign-employees`, {
          userIds: selectedEmployees,
        });
      } else {
        // Create template - for now just create with name, rows/columns can be set from schedule
        const newTemplate = await api.post("/templates", {
          name: templateName,
          rows: null,
          columns: null,
        });
        // Assign employees
        if (selectedEmployees.length > 0) {
          await api.post(`/templates/${newTemplate.id}/assign-employees`, {
            userIds: selectedEmployees,
          });
        }
      }
      closeModal();
      loadTemplates();
    } catch (err) {
      setError(err.message || "Failed to save template");
    }
  }

  async function handleDelete(templateId) {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await api.delete(`/templates/${templateId}`);
      loadTemplates();
    } catch (err) {
      setError(err.message || "Failed to delete template");
    }
  }

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Schedule Templates</h1>
        <button onClick={openCreateModal} style={styles.createButton}>
          + Create Template
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.templatesGrid}>
        {templates.map(template => (
          <div key={template.id} style={styles.templateCard}>
            <div style={styles.templateCardHeader}>
              <div>
                <div style={styles.templateName}>{template.name || "Unnamed Template"}</div>
                <div style={styles.templateInfo}>
                  {template.rows?.length || 0} positions •{" "}
                  {template.columns?.length || 0} columns
                </div>
              </div>
              <div style={styles.templateActions}>
                <button
                  onClick={() => openEditModal(template)}
                  style={styles.actionButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  style={{ ...styles.actionButton, color: "var(--error)" }}
                >
                  Delete
                </button>
              </div>
            </div>

            {template.assignedEmployees && template.assignedEmployees.length > 0 && (
              <div style={styles.assignedEmployees}>
                <div style={styles.assignedEmployeesTitle}>Assigned Employees:</div>
                <div style={styles.employeeList}>
                  {template.assignedEmployees.map(ae => (
                    <span key={ae.user.id} style={styles.employeeTag}>
                      {ae.user.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {templates.length === 0 && (
          <div style={{ ...styles.templateCard, textAlign: "center", padding: "var(--spacing-2xl)" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-lg)" }}>
              No templates yet. Create your first template to get started!
            </p>
            <button onClick={openCreateModal} style={styles.createButton}>
              Create Template
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingTemplate ? "Edit Template" : "Create Template"}
              </h2>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.formGroup}>
              <label style={styles.label}>Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="e.g., Weekday Schedule, Weekend Schedule"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Assign Employees</label>
              <div style={styles.checkboxList}>
                {employees.map(employee => (
                  <div key={employee.id} style={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => toggleEmployee(employee.id)}
                      style={styles.checkbox}
                    />
                    <label style={{ color: "var(--text-primary)", cursor: "pointer" }}>
                      {employee.name}
                    </label>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginTop: "var(--spacing-sm)" }}>
                Employees assigned to this template will only see schedules created with this template.
              </p>
            </div>

            <div style={styles.modalButtons}>
              <button onClick={closeModal} style={{ ...styles.button, ...styles.buttonSecondary }}>
                Cancel
              </button>
              <button onClick={handleSave} style={{ ...styles.button, ...styles.buttonPrimary }}>
                {editingTemplate ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
