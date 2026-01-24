# Push Notifications Setup Guide

This guide explains how to set up push notifications for iOS and Android devices.

## Prerequisites

1. **VAPID Keys**: You need to generate VAPID (Voluntary Application Server Identification) keys for web push notifications.

## Step 1: Generate VAPID Keys

Install the `web-push` package globally (if not already installed):

```bash
npm install -g web-push
```

Generate VAPID keys:

```bash
web-push generate-vapid-keys
```

This will output something like:
```
Public Key: BEl62iUYgUivxIkv69yViEuiBIa40HIgF5Yw...
Private Key: 8V1xasdf...
```

## Step 2: Configure Environment Variables

### Server Environment Variables

Add these to your `server/.env` file:

```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:admin@opticore.ca
```

Also add these to your deployment platform (Render, Cloud Run, etc.):
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (optional, defaults to `mailto:admin@opticore.ca`)

### Client Environment Variables

Add this to your `client/.env` file and Vercel:

```env
VITE_VAPID_PUBLIC_KEY=your_public_key_here
```

**Important**: Use the same public key in both server and client!

## Step 3: Database Migration

Run the Prisma migration to add the `PushSubscription` model:

```bash
cd server
npx prisma db push
```

Or if using migrations:

```bash
npx prisma migrate dev --name add_push_subscriptions
```

## Step 4: Deploy

1. Deploy the server with the new environment variables
2. Deploy the client with `VITE_VAPID_PUBLIC_KEY` set
3. Users will automatically be prompted to allow notifications when they log in

## How It Works

1. **User Login**: When a user logs in, the app automatically requests notification permission and subscribes them to push notifications.

2. **Notifications Sent**:
   - **Availability Request**: When a manager creates an availability request, all employees receive a notification
   - **Schedule Published**: When a schedule is published for the first time, employees are notified
   - **Schedule Redacted**: When a published schedule is unpublished (redacted), employees are notified
   - **Schedule Republished**: When a redacted schedule is published again, employees are notified
   - **App Update**: When a new version of the app is available, users receive an update notification

3. **Notification Actions**:
   - Clicking a notification opens the relevant page in the app
   - Update notifications have "Update Now" and "Later" actions

## Testing

1. Log in as an employee
2. Allow notifications when prompted
3. As a manager, create an availability request or publish a schedule
4. The employee should receive a push notification

## Troubleshooting

- **No notifications**: Check that VAPID keys are correctly set in both server and client
- **Permission denied**: User must allow notifications in their browser settings
- **Service worker not registered**: Check browser console for errors
- **Notifications not received**: Verify the subscription was saved in the database

## Browser Support

- ✅ Chrome/Edge (Android & Desktop)
- ✅ Firefox (Android & Desktop)
- ✅ Safari (iOS 16.4+ and macOS)
- ✅ Samsung Internet (Android)

Note: iOS Safari requires iOS 16.4+ for web push notifications support.
