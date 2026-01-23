import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";

export default function GoogleOAuthCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    console.log("[DEBUG] GoogleOAuthCallback - code:", !!code, "state:", !!state, "error:", error);

    if (error) {
      console.error("[DEBUG] GoogleOAuthCallback - OAuth error:", error);
      window.location.href = `/welcome?error=oauth_failed&details=${encodeURIComponent(error)}`;
      return;
    }

    if (!code) {
      console.error("[DEBUG] GoogleOAuthCallback - no code");
      window.location.href = "/welcome?error=oauth_failed&details=no_code";
      return;
    }

    // Send code to backend to process
    const processCallback = async () => {
      try {
        console.log("[DEBUG] GoogleOAuthCallback - sending code to backend");
        const response = await api.post("/auth/google/process-callback", {
          code,
          state: state || "",
        });

        console.log("[DEBUG] GoogleOAuthCallback - response:", response);

        // If redirect is needed, use window.location.href for mobile compatibility
        if (response.redirectTo) {
          window.location.href = response.redirectTo;
        } else if (response.token) {
          // User exists - save token immediately and redirect
          localStorage.setItem("token", response.token);
          if (response.user) {
            localStorage.setItem("user", JSON.stringify(response.user));
          }
          if (response.business) {
            localStorage.setItem("business", JSON.stringify(response.business));
          }
          // Use window.location.href for mobile Safari compatibility
          setTimeout(() => {
            window.location.href = `/auth/google/success?token=${response.token}`;
          }, 100);
        } else if (response.error === "user_not_found") {
          // User doesn't exist - show error message
          const errorMsg = response.message || "Account not found. Please register first.";
          window.location.href = `/welcome?error=user_not_found&details=${encodeURIComponent(errorMsg)}`;
        } else {
          window.location.href = "/welcome?error=oauth_failed";
        }
      } catch (err) {
        console.error("[DEBUG] GoogleOAuthCallback - error:", err);
        const errorData = err.response?.data;
        if (errorData?.error === "user_not_found") {
          // User doesn't exist - show specific error message
          const errorMsg = errorData.message || "Account not found. Please register first.";
          window.location.href = `/welcome?error=user_not_found&details=${encodeURIComponent(errorMsg)}`;
        } else {
          const errorMsg = errorData?.error || errorData?.message || err.message || "processing_failed";
          window.location.href = `/welcome?error=oauth_failed&details=${encodeURIComponent(errorMsg)}`;
        }
      }
    };

    processCallback();
  }, [searchParams]);

  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Processing Google login...</div>;
}
