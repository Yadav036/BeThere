# Snap Events

Snap Events is a modern, real-time event coordination app built with Next.js, React, Prisma, and Tailwind CSS. It allows users to create events, invite friends, share live locations, and calculate ETAs to event destinations.

---

## Features

- **User Authentication**: Sign up and log in securely using JWT-based authentication.
- **Event Creation**: Create events with a name, time, and location (with optional location sharing).
- **Invitations**: Search for users and invite them to your events.
- **Live Location Reporting**: Participants can share their real-time location with the event.
- **ETA Calculation**: Calculate estimated time of arrival to the event location using your current position.
- **Responsive UI**: Beautiful, mobile-friendly interface styled with Tailwind CSS and shadcn/ui components.

---

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Backend/API**: Next.js API routes
- **Database**: [Prisma ORM](https://www.prisma.io/) (works with PostgreSQL, MySQL, SQLite, etc.)
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Location**: Browser Geolocation API
- **State Management**: React hooks

---

## Project Structure

```
/app
  /api           # Next.js API routes (authentication, events, location updates)
  /home          # Main user dashboard
  /components    # Reusable UI and form components
  /hooks         # Custom React hooks (e.g., useLocationReporter)
  /lib           # Utility libraries (e.g., api fetch, JWT helpers, Prisma client)
  /public        # Static assets
  /styles        # Global styles (Tailwind config, etc.)
/prisma
  schema.prisma  # Prisma schema
```

---

## How Live Location & ETA Work

- The `useLocationReporter` hook uses the browser's Geolocation API to fetch the user's current location every 10 seconds and POST it to the backend.
- The backend stores the latest location for each participant.
- ETA calculation can be performed by fetching the user's latest location and using a directions API (e.g., Google Maps Directions API) to compute travel time to the event location.

---

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/yourusername/snap-events.git
cd snap-events
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add your configuration:

```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key (if using maps)
```

### 4. Set Up the Database

```sh
npx prisma migrate dev --name init
```

### 5. Run the Development Server

```sh
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Start the production server
- `npx prisma studio` - Open Prisma Studio to view/edit the database

---

## Cleaning Up

If you see unused or duplicate folders in the project, you can safely remove them to keep the codebase clean. Only keep folders that are referenced in your imports or are part of the main app structure.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](LICENSE)

---

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
-