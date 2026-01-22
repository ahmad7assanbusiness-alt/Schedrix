import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./auth/useAuth.js";
import Welcome from "./pages/Welcome.jsx";
import CompleteOwnerRegistration from "./pages/CompleteOwnerRegistration.jsx";
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

function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:GoogleCallback',message:'GoogleCallback started',data:{hasToken:!!token,hasError:!!error,apiUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6'})}).catch(()=>{});
    // #endregion
    console.log("[DEBUG] GoogleCallback - token:", token ? "present" : "missing", "error:", error);

    if (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:GoogleCallback',message:'Error in URL params',data:{error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6'})}).catch(()=>{});
      // #endregion
      console.log("[DEBUG] GoogleCallback - redirecting with error:", error);
      navigate(`/welcome?error=${error}`);
      return;
    }

    if (token) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:GoogleCallback',message:'Fetching /auth/me with token',data:{tokenLength:token.length,apiUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6'})}).catch(()=>{});
      // #endregion
      console.log("[DEBUG] GoogleCallback - fetching /auth/me with token");
      // Get user info with the token
      fetch(`${apiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:GoogleCallback',message:'/auth/me response received',data:{status:res.status,statusText:res.statusText,ok:res.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6'})}).catch(()=>{});
          // #endregion
          console.log("[DEBUG] GoogleCallback - /auth/me response:", res.status, res.statusText);
          if (!res.ok) {
            return res.json().then(err => {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:GoogleCallback',message:'/auth/me error response',data:{error:err},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6'})}).catch(()=>{});
              // #endregion
              console.error("[DEBUG] GoogleCallback - /auth/me error:", err);
              throw new Error(err.error || "Failed to authenticate");
            });
          }
          return res.json();
        })
        .then((data) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:GoogleCallback',message:'/auth/me success',data:{hasUser:!!data.user,hasBusiness:!!data.business},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6'})}).catch(()=>{});
          // #endregion
          console.log("[DEBUG] GoogleCallback - /auth/me data:", data);
          if (data.user) {
            login(token, data.user, data.business);
            navigate("/dashboard");
          } else {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:GoogleCallback',message:'No user in response',data:{data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6'})}).catch(()=>{});
            // #endregion
            console.error("[DEBUG] GoogleCallback - no user in response:", data);
            navigate("/welcome?error=auth_failed");
          }
        })
        .catch((err) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:GoogleCallback',message:'/auth/me fetch failed',data:{errorMessage:err.message,errorName:err.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6'})}).catch(()=>{});
          // #endregion
          console.error("[DEBUG] GoogleCallback - fetch error:", err);
          navigate("/welcome?error=auth_failed");
        });
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:GoogleCallback',message:'No token in URL',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6'})}).catch(()=>{});
      // #endregion
      console.error("[DEBUG] GoogleCallback - no token in URL");
      navigate("/welcome?error=no_token");
    }
  }, [searchParams, navigate, login]);

  return <div>Completing login...</div>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/auth/google/complete-owner" element={<CompleteOwnerRegistration />} />
        <Route path="/auth/google/success" element={<GoogleCallback />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        
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
