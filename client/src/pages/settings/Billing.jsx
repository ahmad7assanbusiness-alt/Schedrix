import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api/client.js";
import { useAuth } from "../../auth/useAuth.js";
import { loadStripe } from "@stripe/stripe-js";
import "../../index.css";

// Initialize Stripe (will use env var or empty string if not set)
// Note: In Vite, use import.meta.env, not process.env
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const styles = {
  title: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-xl)",
  },
  currentPlan: {
    padding: "var(--spacing-lg)",
    background: "var(--bg-secondary)",
    borderRadius: "var(--radius-lg)",
    marginBottom: "var(--spacing-xl)",
    border: "2px solid var(--gray-200)",
  },
  currentPlanLabel: {
    fontSize: "var(--font-size-sm)",
    color: "var(--text-secondary)",
    marginBottom: "var(--spacing-xs)",
  },
  currentPlanName: {
    fontSize: "var(--font-size-xl)",
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  plansGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "var(--spacing-lg)",
    marginBottom: "var(--spacing-xl)",
  },
  card: {
    border: "2px solid var(--gray-200)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-xl)",
    background: "var(--bg-primary)",
    display: "flex",
    flexDirection: "column",
    transition: "all var(--transition-base)",
  },
  cardFeatured: {
    borderColor: "var(--primary)",
    borderWidth: "3px",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
  },
  planName: {
    fontSize: "var(--font-size-xl)",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "var(--spacing-sm)",
  },
  planPrice: {
    fontSize: "var(--font-size-3xl)",
    fontWeight: 800,
    color: "var(--primary)",
    marginBottom: "var(--spacing-md)",
  },
  planPriceSubtext: {
    fontSize: "var(--font-size-base)",
    fontWeight: 400,
    color: "var(--text-secondary)",
  },
  featuresList: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 var(--spacing-xl) 0",
    flex: 1,
  },
  featureItem: {
    padding: "var(--spacing-sm) 0",
    color: "var(--text-secondary)",
    fontSize: "var(--font-size-sm)",
    display: "flex",
    alignItems: "flex-start",
    gap: "var(--spacing-sm)",
  },
  featureIcon: {
    color: "var(--success)",
    fontSize: "var(--font-size-base)",
    marginTop: "2px",
  },
  button: {
    padding: "var(--spacing-md) var(--spacing-xl)",
    background: "var(--primary)",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all var(--transition-base)",
    width: "100%",
  },
  buttonCurrent: {
    background: "var(--gray-200)",
    color: "var(--text-secondary)",
    cursor: "not-allowed",
  },
  buttonLoading: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  buttonSecondary: {
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    border: "2px solid var(--gray-300)",
  },
  successMessage: {
    padding: "var(--spacing-md)",
    background: "var(--success-light)",
    color: "var(--success-text)",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--spacing-lg)",
    border: "1px solid var(--success)",
  },
  errorMessage: {
    padding: "var(--spacing-md)",
    background: "var(--error-light)",
    color: "var(--error-text)",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--spacing-lg)",
    border: "1px solid var(--error)",
  },
  manageButton: {
    marginTop: "var(--spacing-md)",
  },
};

export default function Billing() {
  const { business, reload } = useAuth();
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
    
    // Check for success/cancel from Stripe redirect
    if (searchParams.get("success") === "true") {
      setSuccess("Payment successful! Your subscription has been activated.");
      reload(); // Reload business data to get updated subscription status
      // Clean URL
      navigate("/settings/billing", { replace: true });
    } else if (searchParams.get("canceled") === "true") {
      setError("Payment was canceled. No charges were made.");
      navigate("/settings/billing", { replace: true });
    }
  }, [searchParams, navigate, reload]);

  async function loadPlans() {
    try {
      const data = await api.get("/billing/plans");
      setPlans(data);
    } catch (err) {
      console.error("Failed to load plans:", err);
      setError("Failed to load pricing plans. Please try again later.");
    }
  }

  async function handleUpgrade(planId) {
    if (!stripePromise) {
      setError("Stripe is not configured. Please contact support.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { sessionId, url } = await api.post("/billing/create-checkout-session", {
        planId,
      });

      // Redirect to Stripe Checkout
      // Use redirectToCheckout (preferred) or fallback to direct URL
      if (sessionId) {
        const stripe = await stripePromise;
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId,
        });

        if (stripeError) {
          console.error("Stripe error:", stripeError);
          // Fallback to direct URL redirect
          if (url) {
            window.location.href = url;
          } else {
            setError(stripeError.message || "Failed to redirect to checkout");
            setLoading(false);
          }
        }
        // If successful, user will be redirected to Stripe Checkout page
      } else if (url) {
        // Direct URL redirect as fallback
        window.location.href = url;
      } else {
        setError("Failed to create checkout session. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      setError(err.message || "Failed to start checkout. Please try again.");
      setLoading(false);
    }
  }

  async function handleManageSubscription() {
    try {
      setLoading(true);
      setError(null);
      const { url } = await api.post("/billing/portal");
      window.location.href = url;
    } catch (err) {
      console.error("Portal error:", err);
      setError(err.message || "Failed to open customer portal");
      setLoading(false);
    }
  }

  const currentPlanId = business?.subscriptionPlanId || "free";
  const isActive = business?.subscriptionStatus === "active";

  return (
    <div>
      <h2 style={styles.title}>Billing & Subscription</h2>

      {success && <div style={styles.successMessage}>{success}</div>}
      {error && <div style={styles.errorMessage}>{error}</div>}

      <div style={styles.currentPlan}>
        <div style={styles.currentPlanLabel}>Current Plan</div>
        <div style={styles.currentPlanName}>
          {plans[currentPlanId]?.name || "Free Plan"}
          {isActive && currentPlanId !== "free" && (
            <span
              style={{
                marginLeft: "var(--spacing-sm)",
                fontSize: "var(--font-size-sm)",
                color: "var(--success)",
                fontWeight: 400,
              }}
            >
              (Active)
            </span>
          )}
        </div>
        {isActive && currentPlanId !== "free" && (
          <button
            onClick={handleManageSubscription}
            disabled={loading}
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
              ...styles.manageButton,
            }}
          >
            {loading ? "Loading..." : "Manage Subscription"}
          </button>
        )}
      </div>

      <h3
        style={{
          fontSize: "var(--font-size-lg)",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: "var(--spacing-lg)",
        }}
      >
        Available Plans
      </h3>

      <div style={styles.plansGrid}>
        {Object.entries(plans).map(([planId, plan]) => {
          const isCurrentPlan = planId === currentPlanId;
          const isFree = planId === "free";

          return (
            <div
              key={planId}
              style={{
                ...styles.card,
                ...(planId === "pro" ? styles.cardFeatured : {}),
              }}
            >
              <div style={styles.planName}>{plan.name}</div>
              <div style={styles.planPrice}>
                ${plan.price}
                <span style={styles.planPriceSubtext}>/month</span>
              </div>

              <ul style={styles.featuresList}>
                {plan.features?.map((feature, i) => (
                  <li key={i} style={styles.featureItem}>
                    <span style={styles.featureIcon}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                style={{
                  ...styles.button,
                  ...(isCurrentPlan ? styles.buttonCurrent : {}),
                  ...(loading ? styles.buttonLoading : {}),
                }}
                onClick={() => handleUpgrade(planId)}
                disabled={loading || isCurrentPlan || isFree}
              >
                {loading
                  ? "Processing..."
                  : isCurrentPlan
                  ? "Current Plan"
                  : isFree
                  ? "Free Forever"
                  : "Upgrade Plan"}
              </button>
            </div>
          );
        })}
      </div>

      {!stripePromise && (
        <div style={styles.errorMessage}>
          Stripe payment gateway is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in your environment variables.
        </div>
      )}
    </div>
  );
}
