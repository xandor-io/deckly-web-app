# DJ Scheduler

A comprehensive web application for managing DJ bookings, event scheduling, and venue coordination.

## Features

- **Authentication**: Passwordless email/OTP login via Auth0
- **Role-Based Access**:
  - **DJ Dashboard**: View upcoming bookings and event details
  - **Admin Dashboard**: Manage events, venues, and DJ assignments with calendar view
- **Event Management**: Create and schedule events at multiple venues
- **Run of Show**: Assign multiple DJs to time slots for each event
- **Email Notifications**: Automated booking confirmations via Resend
- **DJ Rotation**: Track booking counts and manage fair rotation
- **Genre Matching**: Match DJs to events based on music style
- **Event Automation**: Support for importing events from Ticketmaster, Posh, etc.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Authentication**: Auth0 (Passwordless Email/OTP)
- **Database**: MongoDB with Mongoose
- **Calendar**: React Big Calendar
- **Email**: Resend
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Auth0 account
- Resend account (for email notifications)

### Installation

1. **Install dependencies**:

```bash
npm install
```

2. **Set up environment variables**:

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dj-scheduler?retryWrites=true&w=majority

# Auth0
AUTH0_SECRET=use-a-long-random-string-here
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Resend (for email notifications)
RESEND_API_KEY=your-resend-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Auth0 Setup

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application (Regular Web Application)
3. Enable **Passwordless** authentication:
   - Go to Authentication > Passwordless
   - Enable Email
   - Configure email template
4. Configure application settings:
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
5. Copy your Domain, Client ID, and Client Secret to `.env.local`

### MongoDB Setup

1. Create a MongoDB Atlas cluster or use local MongoDB
2. Create a database named `dj-scheduler`
3. Get your connection string and add it to `.env.local`

### Resend Setup

1. Sign up at [Resend](https://resend.com/)
2. Generate an API key
3. Add it to `.env.local`

### Database Seeding

Seed the database with dummy data:

```bash
npm run seed
```

This will create:
- 3 venues
- 8 DJs with various genres
- 4 users (1 admin: hello@xandor.io, 3 DJs)
- 4 events with run of shows

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Login Credentials

After seeding, you can log in with:
- **Admin**: hello@xandor.io
- **DJs**: dj.nova@example.com, mc.thunder@example.com, dj.rhythm@example.com

## Project Structure

```
dj-scheduler/
├── app/
│   ├── admin/              # Admin dashboard and pages
│   ├── dashboard/          # DJ dashboard
│   ├── api/
│   │   └── auth/           # Auth0 routes
│   ├── layout.tsx          # Root layout with Auth0 provider
│   └── page.tsx            # Landing/login page
├── components/
│   └── EventCalendar.tsx   # Calendar component
├── lib/
│   ├── db.ts               # MongoDB connection
│   └── auth.ts             # Auth utilities
├── models/
│   ├── DJ.ts               # DJ/Artist model
│   ├── Event.ts            # Event model
│   ├── Venue.ts            # Venue model
│   ├── RunOfShow.ts        # Run of Show model
│   └── User.ts             # User model
├── scripts/
│   └── seed.ts             # Database seeding script
└── middleware.ts           # Auth middleware
```

## Database Models

### Venue
- Basic info (name, address, capacity)
- Event source URL for automation (Ticketmaster, Posh, etc.)
- Auto-import settings

### DJ/Artist
- Profile information
- Genres (open_format, house, tech, afrohouse, etc.)
- Booking count for rotation tracking
- Rating

### Event
- Linked to a venue
- Date and time
- Status (draft, scheduled, in_progress, completed, cancelled)
- Import tracking

### Run of Show
- Linked to an event
- Multiple time slots
- Each slot can have multiple DJ assignments
- Booking status tracking (pending, confirmed, declined, cancelled)

### User
- Auth0 integration
- Role-based access (admin, dj)
- Linked to DJ profile if role is DJ

## Next Steps

### To build event creation and Run of Show management:
1. Create API routes for CRUD operations on events
2. Build event creation form
3. Implement Run of Show editor with DJ assignment
4. Add drag-and-drop functionality for time slots

### To implement email notifications:
1. Create email templates
2. Build notification service using Resend
3. Trigger emails when DJs are assigned
4. Add confirmation/decline functionality

### To add DJ auto-assignment:
1. Create algorithm to match DJs by genre
2. Implement rotation logic based on booking count
3. Build auto-assignment UI
4. Add manual override options

### To implement event automation:
1. Create scraping/API integration for ticket platforms
2. Build scheduled task to check for new events
3. Parse and import event data
4. Add deduplication logic

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with dummy data

## Contributing

Feel free to add new features, fix bugs, or improve the codebase!

## License

MIT
