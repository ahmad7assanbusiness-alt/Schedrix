import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/useAuth.js";
import Welcome from "./pages/Welcome.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import OwnerLayout from "./components/OwnerLayout.jsx";
import AvailabilityRequest from "./pages/AvailabilityRequest.jsx";
import AvailabilitySubmit from "./pages/AvailabilitySubmit.jsx";
import Schedule from "./pages/Schedule.jsx";
import ScheduleMy from "./pages/ScheduleMy.jsx";
import Templates from "./pages/Templates.jsx";
import Employees from "./pages/Employees.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/settings/Profile.jsx";
import CalendarSettings from "./pages/settings/Calendar.jsx";
import Security from "./pages/settings/Security.jsx";
import Billing from "./pages/settings/Billing.jsx";
import Support from "./pages/settings/Support.jsx";
import Legal from "./pages/settings/Legal.jsx";

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

function OnboardingCheck({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  // Redirect to onboarding if not completed (for owners/managers only)
  // New accounts default to onboardingCompleted: false
  // Also handle null/undefined for backward compatibility with existing accounts
  const isManager = user.role === "OWNER" || user.role === "MANAGER";
  const pathname = window.location.pathname;
  const needsOnboarding = user.onboardingCompleted === false || user.onboardingCompleted === null || user.onboardingCompleted === undefined;
  
  if (isManager && needsOnboarding && !pathname.startsWith("/onboarding")) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        
        {/* Onboarding route */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Owner/Manager routes with layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <ManagerRoute>
                  <OwnerLayout />
                </ManagerRoute>
              </OnboardingCheck>
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="templates" element={<Templates />} />
          <Route path="employees" element={<Employees />} />
          <Route path="settings" element={<Settings />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="calendar" element={<CalendarSettings />} />
            <Route path="security" element={<Security />} />
            <Route path="billing" element={<Billing />} />
            <Route path="support" element={<Support />} />
            <Route path="legal" element={<Legal />} />
          </Route>
        </Route>

        {/* Legacy routes (for backwards compatibility) */}
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
          path="/schedule/my"
          element={
            <EmployeeRoute>
              <ScheduleMy />
            </EmployeeRoute>
          }
        />
        <Route path="/" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
