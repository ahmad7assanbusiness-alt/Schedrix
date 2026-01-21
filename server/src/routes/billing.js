import express from "express";
import Stripe from "stripe";
import prisma from "../prisma.js";
import { authMiddleware, managerOnly } from "../middleware/auth.js";

const router = express.Router();

// Initialize Stripe (will use env var or empty string if not set)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Define pricing plans
// NOTE: You need to create these products/prices in Stripe Dashboard and update the priceId values
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
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly", // Replace with actual Stripe price ID
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
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise_monthly", // Replace with actual Stripe price ID
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
    res.json(PLANS);
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /billing/create-checkout-session - Create Stripe checkout session
router.post("/create-checkout-session", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables." });
    }

    const { planId } = req.body;

    if (!planId || !PLANS[planId]) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    const plan = PLANS[planId];

    if (!plan.priceId) {
      return res.status(400).json({ error: "This plan is not available for purchase" });
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
      const customer = await stripe.customers.create({
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
    const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
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
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured" });
    }

    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
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
            const subscription = await stripe.subscriptions.retrieve(
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
    if (!stripe) {
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

    const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.billingPortal.sessions.create({
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
