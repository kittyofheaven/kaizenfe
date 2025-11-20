# RTB Connect Facility Booking Frontend

RTB Connect is a Next.js application that provides a management dashboard and self-service booking experience for communal rooms, community work spaces (CWS), serbaguna areas, kitchens, and washing machines. It integrates with the RTB Connect REST API (see `API_DOCUMENTATION.md`) to deliver up-to-date availability, smart time-slot selection, and role-aware access.

## Prerequisites

- Node.js 18 or later (Node 20+ recommended)
- npm (ships with Node) or an alternative such as pnpm/yarn
- Access to a running RTB Connect API instance (local or remote)

## Environment Configuration

The frontend proxies all API calls through Next.js rewrites. Configure the API base URL via environment variable:

```bash
# .env.local
API_BASE_URL=http://localhost:3000
```

- For local development, point to the backend you run locally (default is `http://localhost:3000`).
- For staging/production, set this value to the deployed backend URL before running `npm run build`.

## Installation

```bash
npm install
```

## Development

Start the development server with hot reload:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the app.

## Quality Gates

- Lint the project:

  ```bash
  npm run lint
  ```

- Build (type-checks + production bundle):

  ```bash
  npm run build
  ```

## Production Start

After a successful build, run the production server:

```bash
npm run start
```

## Features at a Glance

- Authenticated dashboard with facility summaries and quick actions
- Communal rooms with smart slot picker filtered by floor
- CWS calendar with daily views and booking context
- Serbaguna, kitchen, and washing machine flows with availability-aware time-slot selection
- Responsive navigation, dark/light theme toggle, and mobile-friendly interactions

Refer to `API_DOCUMENTATION.md` for the comprehensive backend contract, including authentication flows, pagination conventions, time-slot endpoints, and error semantics.
