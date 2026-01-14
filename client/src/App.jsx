import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/useAuth.js";
import Welcome from "./pages/Welcome.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AvailabilityRequest from "./pages/AvailabilityRequest.jsx";
import AvailabilitySubmit from "./pages/AvailabilitySubmit.jsx";
import Schedule from "./pages/Schedule.jsx";
import ScheduleMy from "./pages/ScheduleMy.jsx";
import ScheduleFull from "./pages/ScheduleFull.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
}

function ManagerRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || (user.role !== "OWNER" && user.role !== "MANAGER")) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function EmployeeRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "EMPLOYEE") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/availability/request"
          element={
            <ManagerRoute>
              <AvailabilityRequest />
            </ManagerRoute>
          }
        />
        <Route
          path="/availability/submit"
          element={
            <EmployeeRoute>
              <AvailabilitySubmit />
            </EmployeeRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ManagerRoute>
              <Schedule />
            </ManagerRoute>
          }
        />
        <Route
          path="/schedule/my"
          element={
            <EmployeeRoute>
              <ScheduleMy />
            </EmployeeRoute>
          }
        />
        <Route
          path="/schedule/full"
          element={
            <EmployeeRoute>
              <ScheduleFull />
            </EmployeeRoute>
          }
        />
        <Route path="/" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
