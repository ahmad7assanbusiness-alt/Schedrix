import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import EmployeeSideNav from "./EmployeeSideNav.jsx";
import "../index.css";

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "var(--gray-50)",
  },
  mainContent: {
    marginLeft: "280px",
    flex: 1,
    padding: "var(--spacing-xl)",
    minHeight: "100vh",
    background: "var(--bg-secondary)",
  },
};

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/welcome");
  }

  return (
    <div style={styles.layout}>
      <EmployeeSideNav onLogout={handleLogout} />
      <main style={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
