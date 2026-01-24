import express from "express";
import webpush from "web-push";
import prisma from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Configure VAPID keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@opticore.ca";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} else {
  console.warn("VAPID keys not configured. Push notifications will not work.");
}

// POST /notifications/subscribe - Subscribe user to push notifications
router.post("/subscribe", authMiddleware, async (req, res) => {
  try {
    const subscription = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Invalid subscription" });
    }

    // Save or update subscription
    try {
      await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: req.user.id,
          endpoint: subscription.endpoint,
        },
      },
      create: {
        userId: req.user.id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      update: {
        keys: subscription.keys,
      },
      });
    } catch (dbError) {
      // Table doesn't exist yet
      if (dbError.code === 'P2021' || dbError.message?.includes('does not exist')) {
        return res.status(503).json({ 
          error: "Push notifications not configured. Database migration required.",
          message: "Please run 'prisma db push' to create the PushSubscription table."
        });
      }
      throw dbError;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /notifications/unsubscribe - Unsubscribe user from push notifications
router.post("/unsubscribe", authMiddleware, async (req, res) => {
  try {
    const subscription = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Invalid subscription" });
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        userId: req.user.id,
        endpoint: subscription.endpoint,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper function to send notification to user
export async function sendNotificationToUser(userId, notification) {
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.warn("VAPID keys not configured, skipping notification");
      return;
    }

    // Check if PushSubscription table exists (graceful degradation)
    let subscriptions;
    try {
      subscriptions = await prisma.pushSubscription.findMany({
        where: { userId },
      });
    } catch (dbError) {
      // Table doesn't exist yet - log and continue without sending notifications
      if (dbError.code === 'P2021' || dbError.message?.includes('does not exist')) {
        console.warn("PushSubscription table does not exist. Run 'prisma db push' to create it.");
        return;
      }
      throw dbError;
    }

    const promises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          JSON.stringify(notification)
        );
      } catch (error) {
        console.error(`Error sending notification to ${sub.endpoint}:`, error);
        // If subscription is invalid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
        }
      }
    });

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

// Helper function to send notification to all employees in a business
export async function sendNotificationToBusinessEmployees(
  businessId,
  notification,
  excludeUserId = null
) {
  try {
    const employees = await prisma.user.findMany({
      where: {
        businessId,
        role: "EMPLOYEE",
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
    });

    const promises = employees.map((employee) =>
      sendNotificationToUser(employee.id, notification)
    );

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Error sending notification to business employees:", error);
  }
}

// POST /notifications/permission - Update user notification permission
router.post("/permission", authMiddleware, async (req, res) => {
  try {
    const { permission, prompted } = req.body;
    const userId = req.user.id;

    if (!["pending", "granted", "denied"].includes(permission)) {
      return res.status(400).json({ error: "Invalid permission value" });
    }

    // Update user's notification permission
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        notificationPermission: permission,
        notificationPrompted: prompted,
        updatedAt: new Date(),
      },
    });

    res.json({ 
      message: "Notification permission updated successfully",
      notificationPermission: updatedUser.notificationPermission,
      notificationPrompted: updatedUser.notificationPrompted,
    });
  } catch (error) {
    console.error("Error updating notification permission:", error);
    res.status(500).json({ error: "Failed to update notification permission" });
  }
});

export default router;
