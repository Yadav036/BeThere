
# beThere

**beThere** is a modern, real-time event coordination app that makes organizing and attending events with friends effortless. Built with **Next.js**, **React**, **Prisma**, and **Tailwind CSS**, it allows you to create events, invite friends, share live locations, and see ETAs to event destinations.

---

## What It Does

* **Secure Sign-In** – Log in or sign up using JWT-based authentication.
* **Create Events** – Add events with a name, time, and location. You can optionally allow location sharing for attendees.
* **Invite Friends** – Search for friends and invite them to your events.
* **Live Location Sharing** – Participants can share their location in real time.
* **ETA Tracking** – See estimated arrival times for everyone heading to the event.
* **Mobile-Friendly Design** – Clean, responsive UI styled with Tailwind CSS and shadcn/ui components.

---

## Tech Stack

* **Frontend:** Next.js, React, TypeScript
* **Backend/API:** Next.js API routes
* **Database:** Prisma ORM (PostgreSQL / MySQL / SQLite)
* **Authentication:** JWT
* **Styling:** Tailwind CSS, shadcn/ui
* **Location & Maps:** Browser Geolocation API, optionally Google Maps API
* **State Management:** React hooks

---

## How It Works (Briefly)

* The **`useLocationReporter`** hook tracks the user’s location every few seconds and sends it to the backend.
* The backend keeps the latest location for each participant.
* ETA calculation is done by comparing the user’s current location with the event location, using a directions API if needed.

---

## Project Structure

```
/app
  /api           # Backend routes (auth, events, locations)
  /home          # Main dashboard
  /components    # Reusable UI components
  /hooks         # Custom hooks like useLocationReporter
  /lib           # Utilities (API calls, JWT helpers, Prisma client)
  /public        # Images and static assets
  /styles        # Global styles and Tailwind config
/prisma
  schema.prisma  # Prisma database schema
```

---

## Getting Started

1. **Clone the repo**

```bash
git clone https://github.com/yadav036/bethere.git
cd bethere
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file at the root:

```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

4. **Initialize the database**

```bash
npx prisma migrate dev --name init
```

5. **Run the app locally**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and start exploring!

---

## Useful Scripts

* `npm run dev` – Start development server
* `npm run build` – Build for production
* `npm run start` – Start production server
* `npx prisma studio` – View and edit your database in Prisma Studio

