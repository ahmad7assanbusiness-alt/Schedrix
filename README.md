# ScheduleManager PWA

Enterprise-grade schedule and workforce planning platform - MVP.

## Tech Stack

- **Client**: React + Vite (PWA)
- **Server**: Node.js + Express
- **Database**: PostgreSQL + Prisma
- **Auth**: JWT (simple access tokens)

## Prerequisites

- Node.js 18+
- PostgreSQL (local or remote)
- npm

## Setup

### 1. Database Setup

Make sure PostgreSQL is running. Update `server/.env` with your database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/schedule_app?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
PORT=4000
```

### 2. Install Dependencies

From the repo root:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Run Database Migrations

From the `server` directory:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run the Application

**Terminal 1 - Server:**
```bash
npm run dev:server
```
Server runs on: http://localhost:4000

**Terminal 2 - Client:**
```bash
npm run dev:client
```
Client runs on: http://localhost:5173

## MVP Flow

### Owner/Manager Flow

1. **Create Business**
   - Go to `/welcome`
   - Click "Create Business (Owner)"
   - Enter business name and owner name
   - Receive join code

2. **Request Availability**
   - Go to Dashboard → "Availability Requests"
   - Create a new availability request (date range)
   - View employee availability entries

3. **Build Schedule**
   - Go to Dashboard → "Schedule Builder"
   - Create a schedule week
   - Click on empty cells to assign employees (filtered by availability)
   - Publish the schedule

### Employee Flow

1. **Join Business**
   - Go to `/welcome`
   - Click "Join Business (Employee)"
   - Enter join code and employee name

2. **Submit Availability**
   - Go to Dashboard → "Submit Availability"
   - Select morning/evening for each date
   - Submit availability

3. **View Schedule**
   - Go to Dashboard → "My Schedule" (view only your shifts)
   - Or "Full Schedule" (view all employees' shifts)

## Project Structure

```
.
├── client/          # React + Vite PWA
│   ├── src/
│   │   ├── api/     # API client with auth
│   │   ├── auth/    # Auth hooks
│   │   └── pages/   # React pages
├── server/          # Express API
│   ├── src/
│   │   ├── routes/  # API routes
│   │   └── middleware/ # Auth middleware
│   └── prisma/      # Prisma schema
└── shared/          # Future shared types
```

## API Endpoints

### Auth
- `POST /auth/bootstrap-owner` - Create business + owner
- `POST /auth/join` - Employee joins with code
- `GET /auth/me` - Get current user

### Availability
- `POST /availability-requests` - Create request (manager)
- `GET /availability-requests/open` - Get open request
- `GET /availability-requests` - List requests (manager)
- `POST /availability-entries` - Submit availability (employee)
- `GET /availability-requests/:id/entries` - View entries (manager)

### Scheduling
- `POST /schedules` - Create schedule (manager)
- `GET /schedules` - List schedules
- `GET /schedules/:id` - Get schedule details
- `POST /schedules/:id/assignments` - Assign/unassign shift
- `POST /schedules/:id/publish` - Publish schedule

## Development

- All routes are protected by JWT authentication (except bootstrap/join)
- Manager routes require OWNER or MANAGER role
- Employee routes require EMPLOYEE role
- All data is scoped to the user's business

