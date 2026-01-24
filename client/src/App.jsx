import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./auth/useAuth.js";
import { api } from "./api/client.js";
import InstallPrompt from "./components/InstallPrompt.jsx";
import NotificationPrompt from "./components/NotificationPrompt.jsx";
import Welcome from "./pages/Welcome.jsx";
import CompleteOwnerRegistration from "./pages/CompleteOwnerRegistration.jsx";
import CompleteEmployeeRegistration from "./pages/CompleteEmployeeRegistration.jsx";
import GoogleOAuthCallback from "./pages/GoogleOAuthCallback.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import OwnerLayout from "./components/OwnerLayout.jsx";
import EmployeeLayout from "./components/EmployeeLayout.jsx";
import AvailabilityRequest from "./pages/AvailabilityRequest.jsx";

// Component to redirect dashboard based on user role
function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  const isManager = user.role === "OWNER" || user.role === "MANAGER";
  
  if (isManager) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/employee/dashboard" replace />;
  }
}

// Component to render dashboard with appropriate layout based on user role
function DashboardWithLayout() {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Loading...</div>;
  }

  const isManager = user.role === "OWNER" || user.role === "MANAGER";
  
  if (isManager) {
    return (
      <OwnerLayout>
        <Dashboard />
      </OwnerLayout>
    );
  } else {
    return (
      <EmployeeLayout>
        <Dashboard />
      </EmployeeLayout>
    );
  }
}
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
    // If not employee, redirect to appropriate dashboard
    if (user && (user.role === "OWNER" || user.role === "MANAGER")) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/welcome" replace />;
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

function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    console.log("[DEBUG] GoogleCallback - token:", token ? "present" : "missing", "error:", error);

    if (error) {
      console.log("[DEBUG] GoogleCallback - redirecting with error:", error);
      window.location.href = `/welcome?error=${error}`;
      return;
    }

    if (token) {
      console.log("[DEBUG] GoogleCallback - processing token");
      // Save token immediately
      api.setToken(token);
      
      // Retry logic for network failures
      const fetchUserWithRetry = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            console.log(`[DEBUG] GoogleCallback - fetching /auth/me (attempt ${i + 1}/${retries})`);
            const data = await api.get("/auth/me");
            
            console.log("[DEBUG] GoogleCallback - /auth/me data:", data);
            if (data.user) {
              // Save everything to localStorage
              localStorage.setItem("token", token);
              localStorage.setItem("user", JSON.stringify(data.user));
              if (data.business) {
                localStorage.setItem("business", JSON.stringify(data.business));
              }
              
              // Update auth state
              login(token, data.user, data.business);
              
              // Determine redirect path
              const isManager = data.user.role === "OWNER" || data.user.role === "MANAGER";
              const redirectPath = isManager ? "/dashboard" : "/employee/dashboard";
              
              // Use window.location.href for mobile Safari - force full page reload
              setTimeout(() => {
                window.location.href = redirectPath;
              }, 300);
              return; // Success, exit retry loop
            } else {
              throw new Error("No user in response");
            }
          } catch (err) {
            console.error(`[DEBUG] GoogleCallback - attempt ${i + 1} failed:`, err);
            
            // If it's the last retry, give up
            if (i === retries - 1) {
              console.error("[DEBUG] GoogleCallback - all retries failed");
              // Clear token on error
              api.setToken(null);
              localStorage.removeItem("token");
              
              // Show better error message
              const errorMsg = err.message?.includes("Cannot connect") 
                ? "network_error" 
                : "auth_failed";
              window.location.href = `/welcome?error=${errorMsg}`;
              return;
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      };
      
      fetchUserWithRetry();
    } else {
      console.error("[DEBUG] GoogleCallback - no token in URL");
      window.location.href = "/welcome?error=no_token";
    }
  }, [searchParams, login]);

  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Completing login...</div>;
}

function App() {
  return (
    <BrowserRouter>
      <InstallPrompt />
      <NotificationPrompt />
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />
        <Route path="/auth/google/complete-owner" element={<CompleteOwnerRegistration />} />
        <Route path="/auth/google/complete-employee" element={<CompleteEmployeeRegistration />} />
        <Route path="/auth/google/success" element={<GoogleCallback />} />
        
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

        {/* Employee routes with layout */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute>
              <EmployeeRoute>
                <EmployeeLayout />
              </EmployeeRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="availability/submit" element={<AvailabilitySubmit />} />
          <Route path="schedule/my" element={<ScheduleMy />} />
          <Route path="settings" element={<Settings />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="calendar" element={<CalendarSettings />} />
            <Route path="security" element={<Security />} />
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
            <ProtectedRoute>
              <EmployeeRoute>
                <Navigate to="/employee/availability/submit" replace />
              </EmployeeRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule/my"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <EmployeeRoute>
                  <EmployeeLayout>
                    <ScheduleMy />
                  </EmployeeLayout>
                </EmployeeRoute>
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />
        
        {/* Dashboard redirect - route employees to employee layout, managers to manager layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
