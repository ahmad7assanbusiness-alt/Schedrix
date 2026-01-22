import express from "express";
import Stripe from "stripe";
import prisma from "../prisma.js";
import { authMiddleware, managerOnly } from "../middleware/auth.js";

const router = express.Router();

// Initialize Stripe (will use env var or empty string if not set)
// On Render/Railway, environment variables are available directly in process.env
// On local development, dotenv.config() must be called first in index.js
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  
  // Detailed logging for debugging
  if (!key) {
    console.error("❌ STRIPE_SECRET_KEY is not set!");
    console.log("Environment check:");
    console.log("  - NODE_ENV:", process.env.NODE_ENV);
    console.log("  - All STRIPE_ vars:", Object.keys(process.env).filter(k => k.includes('STRIPE')));
    console.log("  - STRIPE_SECRET_KEY type:", typeof process.env.STRIPE_SECRET_KEY);
    console.log("  - STRIPE_SECRET_KEY value:", process.env.STRIPE_SECRET_KEY);
    return null;
  }
  
  // Validate key format
  if (!key.startsWith('sk_test_') && !key.startsWith('sk_live_')) {
    console.error("❌ STRIPE_SECRET_KEY format is invalid! Should start with sk_test_ or sk_live_");
    console.log("  - Key starts with:", key.substring(0, 10));
    return null;
  }
  
  try {
    const stripeInstance = new Stripe(key);
    console.log("✅ Stripe initialized successfully");
    console.log("  - Key type:", key.startsWith('sk_test_') ? 'TEST' : 'LIVE');
    console.log("  - Key prefix:", key.substring(0, 10) + '...' + key.substring(key.length - 4));
    return stripeInstance;
  } catch (error) {
    console.error("❌ Error initializing Stripe:", error);
    return null;
  }
};

// Initialize at module load
const stripe = getStripe();

// Helper function to get price ID from product ID or return price ID directly
async function getPriceId(productOrPriceId) {
  const stripeInstance = stripe || getStripe();
  if (!productOrPriceId || !stripeInstance) return null;
  
  // If it's already a price ID (starts with price_), return it
  if (productOrPriceId.startsWith("price_")) {
    return productOrPriceId;
  }
  
  // If it's a product ID (starts with prod_), fetch the first active price
  if (productOrPriceId.startsWith("prod_")) {
    try {
      const prices = await stripeInstance.prices.list({
        product: productOrPriceId,
        active: true,
        limit: 1,
      });
      if (prices.data.length > 0) {
        return prices.data[0].id;
      }
    } catch (error) {
      console.error("Error fetching price from product:", error);
    }
  }
  
  return null;
}

// Define pricing plans
// NOTE: You can use either product IDs (prod_...) or price IDs (price_...) in environment variables
// If using product IDs, the code will automatically fetch the first active price
const PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    features: ["Basic scheduling", "Up to 5 employees", "1 schedule template"],
  },
  pro: {
    name: "Pro",
    price: 29,
    productOrPriceId: process.env.STRIPE_PRO_PRICE_ID || null,
    priceId: null, // Will be resolved on first use
    features: [
      "Unlimited schedules",
      "Unlimited employees",
      "Multiple templates",
      "Priority support",
      "Advanced features",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: 99,
    productOrPriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || null,
    priceId: null, // Will be resolved on first use
    features: [
      "Everything in Pro",
      "Custom integrations",
      "Dedicated support",
      "Custom reporting",
      "API access",
    ],
  },
};

// GET /billing/plans - Get available plans
router.get("/plans", authMiddleware, managerOnly, async (req, res) => {
  try {
    // Ensure price IDs are resolved before returning plans
    const plansWithPrices = { ...PLANS };
    
    if (plansWithPrices.pro.productOrPriceId && !plansWithPrices.pro.priceId) {
      plansWithPrices.pro.priceId = await getPriceId(plansWithPrices.pro.productOrPriceId);
      if (plansWithPrices.pro.priceId && plansWithPrices.pro.priceId.startsWith("price_")) {
        try {
          const price = await (stripe || getStripe())?.prices.retrieve(plansWithPrices.pro.priceId);
          if (price.unit_amount) {
            plansWithPrices.pro.price = price.unit_amount / 100;
          }
        } catch (error) {
          console.error("Error fetching Pro price details:", error);
        }
      }
    }
    
    if (plansWithPrices.enterprise.productOrPriceId && !plansWithPrices.enterprise.priceId) {
      plansWithPrices.enterprise.priceId = await getPriceId(plansWithPrices.enterprise.productOrPriceId);
      if (plansWithPrices.enterprise.priceId && plansWithPrices.enterprise.priceId.startsWith("price_")) {
        try {
          const price = await (stripe || getStripe())?.prices.retrieve(plansWithPrices.enterprise.priceId);
          if (price.unit_amount) {
            plansWithPrices.enterprise.price = price.unit_amount / 100;
          }
        } catch (error) {
          console.error("Error fetching Enterprise price details:", error);
        }
      }
    }
    
    // Remove internal fields before sending to client
    const response = {
      free: {
        name: plansWithPrices.free.name,
        price: plansWithPrices.free.price,
        features: plansWithPrices.free.features,
      },
      pro: {
        name: plansWithPrices.pro.name,
        price: plansWithPrices.pro.price,
        features: plansWithPrices.pro.features,
      },
      enterprise: {
        name: plansWithPrices.enterprise.name,
        price: plansWithPrices.enterprise.price,
        features: plansWithPrices.enterprise.features,
      },
    };
    
    res.json(response);
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /billing/create-checkout-session - Create Stripe checkout session
router.post("/create-checkout-session", authMiddleware, managerOnly, async (req, res) => {
  try {
    // Check if Stripe is configured (handle both module load time and runtime)
    const stripeInstance = stripe || getStripe();
    if (!stripeInstance) {
      console.error("STRIPE_SECRET_KEY is not set. Current env keys:", Object.keys(process.env).filter(k => k.includes('STRIPE')));
      return res.status(503).json({ 
        error: "Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.",
        hint: "On Render/Railway, ensure the environment variable is set in your service settings and the service has been restarted."
      });
    }

    const { planId } = req.body;

    if (!planId || !PLANS[planId]) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    const plan = PLANS[planId];

    // Ensure price ID is initialized (convert product ID to price ID if needed)
    if (!plan.priceId && plan.productOrPriceId) {
      plan.priceId = await getPriceId(plan.productOrPriceId);
      if (plan.priceId && plan.priceId.startsWith("price_")) {
        // Update display price from Stripe
        try {
          const price = await stripeInstance.prices.retrieve(plan.priceId);
          if (price.unit_amount) {
            plan.price = price.unit_amount / 100;
          }
        } catch (error) {
          console.error("Error fetching price details:", error);
        }
      }
    }

    if (!plan.priceId) {
      return res.status(400).json({ 
        error: "This plan is not available for purchase. Please configure STRIPE_PRO_PRICE_ID or STRIPE_ENTERPRISE_PRICE_ID with either a product ID (prod_...) or price ID (price_...)." 
      });
    }

    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    // Get business
    let business = await prisma.business.findUnique({
      where: { id: req.user.businessId },
    });

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Get or create Stripe customer
    let customerId = business.stripeCustomerId;

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripeInstance.customers.create({
        email: req.user.email || undefined,
        name: business.name,
        metadata: {
          businessId: business.id,
          userId: req.user.id,
        },
      });

      customerId = customer.id;

      // Save customer ID to database
      await prisma.business.update({
        where: { id: business.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Get client URL from environment or use default
    // Remove trailing slash and any paths to ensure we have base URL only
    let clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";
    // Normalize: remove trailing slash and extract base URL if path is included
    clientUrl = clientUrl.replace(/\/+$/, ""); // Remove trailing slashes
    // If URL contains /settings/billing, remove it (should be base URL only)
    clientUrl = clientUrl.replace(/\/settings\/billing.*$/, "");

    // Create checkout session
    const session = await stripeInstance.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${clientUrl}/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/settings/billing?canceled=true`,
      metadata: {
        businessId: business.id,
        planId: planId,
      },
      subscription_data: {
        metadata: {
          businessId: business.id,
          planId: planId,
        },
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({
      error: error.message || "Failed to create checkout session",
    });
  }
});

// POST /billing/webhook - Handle Stripe webhooks
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
      const stripeInstance = stripe || getStripe();
      if (!stripeInstance) {
      console.error("STRIPE_SECRET_KEY is not set in webhook handler");
      return res.status(503).json({ error: "Stripe is not configured" });
    }

    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripeInstance.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          
          if (session.mode === "subscription") {
            const subscription = await stripeInstance.subscriptions.retrieve(
              session.subscription
            );

            await prisma.business.update({
              where: { stripeCustomerId: session.customer },
              data: {
                subscriptionStatus: "active",
                stripeSubscriptionId: subscription.id,
                subscriptionPlanId: session.metadata?.planId || subscription.metadata?.planId,
              },
            });
          }
          break;
        }

        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const status = subscription.status === "active" ? "active" : "inactive";

          await prisma.business.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              subscriptionStatus: status,
              subscriptionPlanId:
                status === "active"
                  ? subscription.metadata?.planId || null
                  : null,
            },
          });
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          if (invoice.subscription) {
            await prisma.business.update({
              where: { stripeSubscriptionId: invoice.subscription },
              data: {
                subscriptionStatus: "active",
              },
            });
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object;
          if (invoice.subscription) {
            // Optionally handle failed payments
            console.log("Payment failed for subscription:", invoice.subscription);
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook handler error:", error);
      res.status(500).json({ error: "Webhook handler failed" });
    }
  }
);

// GET /billing/portal - Create customer portal session for managing subscription
router.post("/portal", authMiddleware, managerOnly, async (req, res) => {
  try {
      const stripeInstance = stripe || getStripe();
      if (!stripeInstance) {
      console.error("STRIPE_SECRET_KEY is not set in webhook handler");
      return res.status(503).json({ error: "Stripe is not configured" });
    }

    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const business = await prisma.business.findUnique({
      where: { id: req.user.businessId },
    });

    if (!business || !business.stripeCustomerId) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    // Get client URL from environment or use default
    let clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";
    // Normalize: remove trailing slash and any paths
    clientUrl = clientUrl.replace(/\/+$/, "");
    clientUrl = clientUrl.replace(/\/settings\/billing.*$/, "");

    const session = await stripeInstance.billingPortal.sessions.create({
      customer: business.stripeCustomerId,
      return_url: `${clientUrl}/settings/billing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Portal session error:", error);
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

export default router;
