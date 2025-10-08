# TalentFlow

A modern hiring platform to manage jobs, track candidates, and create assessments.

---

## Table of Contents

- [Setup](#setup)
- [Development Workflow](#development-workflow)
- [Architecture Overview](#architecture-overview)
- [Mocking & Data](#mocking--data)
- [Deployment](#deployment)
- [Known Issues](#known-issues)
- [Technical Decisions](#technical-decisions)

---

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Start the development server:**
   ```sh
   npm run dev
   ```
   This runs Vite on port 8080 (see [`vite.config.ts`](vite.config.ts)).

3. **Linting:**
   ```sh
   npm run lint
   ```

4. **Build for production:**
   ```sh
   npm run build
   ```

---

## Development Workflow

- **Mock API:** Uses [MSW](https://mswjs.io/) for local API mocking. See [`src/mocks/browser.ts`](src/mocks/browser.ts) and [`public/mockServiceWorker.js`](public/mockServiceWorker.js).
- **Database:** Uses [Dexie.js](https://dexie.org/) for IndexedDB-based local storage. See [`src/lib/db.ts`](src/lib/db.ts).
- **Component Library:** Custom UI components in [`src/components/ui/`](src/components/ui/).
- **Routing:** React Router in [`src/App.tsx`](src/App.tsx).
- **State Management:** React Query for server state, React hooks for local state.

---

## Architecture Overview

- **Frontend:** React + Vite + TypeScript
- **UI:** Tailwind CSS, custom components
- **API Layer:** [`src/lib/api.ts`](src/lib/api.ts) abstracts API calls (mocked in dev)
- **Mock Data:** [`src/lib/mockData.ts`](src/lib/mockData.ts) and [`src/lib/db.ts`](src/lib/db.ts) generate and seed data
- **Pages:** Located in [`src/pages/`](src/pages/)
- **MSW Handlers:** [`src/mocks/handlers.ts`](src/mocks/handlers.ts) define mock API endpoints

---

## Mocking & Data

- **Local Development:** All API requests to `/api/*` are intercepted and handled by MSW, using mock data from IndexedDB.
- **Production:** MSW is disabled; real API endpoints must be available.
- **Seeding:** On first run, the database is seeded with jobs, candidates, and assessments.

---

## Deployment

- **Vercel:** The app is designed for static hosting. Ensure your backend API is available for production, as MSW only works locally.
- **Static Assets:** Served from the `public/` directory.

---

## Known Issues

- **404 on `/jobs` in Production:**  
  The mock API only works locally. On Vercel, ensure your backend provides `/api/jobs` and related endpoints.
- **MSW Service Worker:**  
  [`public/mockServiceWorker.js`](public/mockServiceWorker.js) must **not** be served in production.
- **LocalStorage/IndexedDB:**  
  Data is not shared between users or environments; it's only for local development.

---

## Technical Decisions

- **MSW for Mocking:**  
  Enables rapid frontend development without a backend.
- **Dexie.js for IndexedDB:**  
  Provides a simple, persistent local database for mock data.
- **React Query:**  
  Handles server state and caching for API data.
- **Tailwind CSS:**  
  Utility-first styling for rapid UI development.
- **Vite:**  
  Fast build tool and dev server for modern React apps.
- **TypeScript:**  
  Ensures type safety across the codebase.
- **Component Structure:**  
  UI primitives are colocated in [`src/components/ui/`](src/components/ui/) for reusability.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Submit a PR

---

## License

MIT
